package com.theggwp.theggwp_orchestrator_service.job;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiterRegistry;
import com.theggwp.theggwp_orchestrator_service.repository.TournamentRepository;
import com.theggwp.theggwp_orchestrator_service.source.pandascore.ParsedTournaments;
import com.theggwp.theggwp_orchestrator_service.source.pandascore.PandascoreTournamentSource;
import com.theggwp.theggwp_orchestrator_service.workflow.Workflow;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowBuilder;
import com.theggwp.theggwp_orchestrator_service.workflow.step.ConsumerStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.FetchStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.TransformStep;

/**
 * Concrete scheduled job that pulls Valorant tournaments from Pandascore and stores them.
 *
 * <p>The pipeline is assembled declaratively:
 * <pre>
 *   fetch (Void -&gt; String JSON)
 *     -&gt; parse (String -&gt; ParsedTournaments)
 *     -&gt; persist (ParsedTournaments -&gt; Void)
 * </pre>
 * To add an extra processing stage (e.g. validation, normalisation, publishing to a queue),
 * insert another {@code .then(...)} step - no other code needs to change.</p>
 */
@Component
public class PandascoreTournamentJob extends ScheduledWorkflowJob<Void, Void> {

    public static final String JOB_NAME = "pandascore-tournaments";

    private final Workflow<Void, Void> workflow;

    public PandascoreTournamentJob(RateLimiterRegistry rateLimiterRegistry,
                                   PandascoreTournamentSource source,
                                   TournamentRepository repository) {
        super(rateLimiterRegistry);
        this.workflow = WorkflowBuilder.named(JOB_NAME)
                .start(new FetchStep<String>(source))
                .then(new TransformStep<String, ParsedTournaments>("parse-tournaments",
                        PandascoreTournamentJob::parse))
                .then(new ConsumerStep<ParsedTournaments>("persist-tournaments",
                        parsed -> repository.upsertLatest(parsed.rawJson(), parsed.fetchedAt())))
                .build();
    }

    /**
     * Scheduled trigger. Interval is configured via {@code pandascore.poll-interval-ms}.
     */
    @Scheduled(fixedDelayString = "${pandascore.poll-interval-ms}")
    public void schedule() {
        trigger();
    }

    @Override
    protected String jobName() {
        return JOB_NAME;
    }

    @Override
    protected Workflow<Void, Void> workflow() {
        return workflow;
    }

    @Override
    protected Void workflowInput() {
        return null;
    }

    /**
     * Parse step body. Performs a lightweight, dependency-free extraction (a rough count of
     * top-level objects) and wraps the payload. Richer parsing/mapping can be added as a new
     * {@link TransformStep} without touching the rest of the pipeline.
     */
    private static ParsedTournaments parse(String json) {
        long now = Instant.now().getEpochSecond();
        int count = roughCount(json);
        return new ParsedTournaments(json, count, now);
    }

    private static int roughCount(String json) {
        if (json == null) {
            return -1;
        }
        String trimmed = json.trim();
        if (trimmed.isEmpty() || "[]".equals(trimmed)) {
            return 0;
        }
        if (!trimmed.startsWith("[")) {
            return -1;
        }
        // Count top-level objects by counting unnested '{' braces.
        int count = 0;
        int depth = 0;
        boolean inString = false;
        boolean escaped = false;
        for (int i = 0; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (escaped) {
                escaped = false;
                continue;
            }
            if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                inString = !inString;
            } else if (!inString) {
                if (c == '{') {
                    if (depth == 0) {
                        count++;
                    }
                    depth++;
                } else if (c == '}') {
                    depth--;
                }
            }
        }
        return count;
    }
}
