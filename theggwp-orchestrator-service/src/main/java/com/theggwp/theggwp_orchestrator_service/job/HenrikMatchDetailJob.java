package com.theggwp.theggwp_orchestrator_service.job;

import java.time.Instant;

import org.json.JSONObject;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiterRegistry;
import com.theggwp.theggwp_orchestrator_service.source.henrik.HenrikMatchDetailSource;
import com.theggwp.theggwp_orchestrator_service.source.henrik.HenrikProperties;
import com.theggwp.theggwp_orchestrator_service.workflow.Workflow;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowBuilder;
import com.theggwp.theggwp_orchestrator_service.workflow.step.ConsumerStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.FetchStep;

/**
 * Scheduled job that drills into specific Valorant matches by UUID via Henrik
 * {@code /valorant/v2/match/{matchid}} and persists the full game/round/player-stat detail.
 *
 * <p>The {@code matchid} for this endpoint is a Valorant match <b>UUID</b> — <i>not</i> an esports
 * schedule match id (those are lolesports ids in a different namespace and do not resolve here).
 * UUIDs are supplied explicitly via {@code henrik.match-uuids}; when none are configured the job
 * is a no-op. The bulk of stat ingestion is handled by {@link HenrikPlayerMatchJob}; this job
 * exists for targeted drill-down on a known match UUID.</p>
 */
@Component
public class HenrikMatchDetailJob extends ScheduledWorkflowJob<Void, Void> {

    public static final String JOB_NAME = "henrik-match-details";

    private final HenrikProperties properties;
    private final HenrikMatchDetailSource source;
    private final HenrikMatchParser parser;
    private final RateLimiterRegistry rateLimiterRegistry;

    public HenrikMatchDetailJob(RateLimiterRegistry rateLimiterRegistry,
                                HenrikProperties properties,
                                HenrikMatchDetailSource source,
                                HenrikMatchParser parser) {
        super(rateLimiterRegistry);
        this.properties = properties;
        this.source = source;
        this.parser = parser;
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    @Scheduled(fixedDelayString = "${henrik.match-detail-poll-interval-ms:600000}")
    public void schedule() {
        String uuids = properties.getMatchUuids();
        if (uuids == null || uuids.isBlank()) {
            log.debug("[job:{}] no match UUIDs configured (henrik.match-uuids); skipping", JOB_NAME);
            return;
        }

        for (String entry : uuids.split(",")) {
            String matchId = entry.trim();
            if (matchId.isEmpty()) {
                continue;
            }
            if (!rateLimiterRegistry.get(JOB_NAME).tryAcquire()) {
                log.warn("[job:{}] rate limit reached, stopping cycle", JOB_NAME);
                break;
            }
            try {
                fetchAndPersist(matchId);
            } catch (Exception e) {
                log.error("[job:{}] failed to fetch detail for match {}", JOB_NAME, matchId, e);
            }
        }
    }

    private void fetchAndPersist(String matchId) {
        source.setMatchId(matchId);

        Workflow<Void, Void> workflow = WorkflowBuilder.named(JOB_NAME + "-" + matchId)
                .start(new FetchStep<String>(source))
                .then(new ConsumerStep<String>("persist-match-detail", this::persistMatchDetail))
                .build();

        workflow.run(null);
    }

    private void persistMatchDetail(String json) {
        if (json == null || json.isBlank()) {
            return;
        }
        long fetchedAt = Instant.now().getEpochSecond();
        JSONObject response = new JSONObject(json);

        // v2/match returns { status, data: <game> }; tolerate a bare game object too.
        JSONObject game = response.optJSONObject("data");
        if (game == null) {
            game = response;
        }
        String gameId = parser.persistGame(game, fetchedAt);
        log.info("[job:{}] persisted detail for game {}", JOB_NAME, gameId);
    }

    @Override
    protected String jobName() {
        return JOB_NAME;
    }

    @Override
    protected Workflow<Void, Void> workflow() {
        return null; // per-UUID workflows are built dynamically in schedule()
    }

    @Override
    protected Void workflowInput() {
        return null;
    }
}
