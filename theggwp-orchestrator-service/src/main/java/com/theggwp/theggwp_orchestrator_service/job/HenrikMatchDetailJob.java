package com.theggwp.theggwp_orchestrator_service.job;

import java.time.Instant;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiterRegistry;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikGameRepository;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikRoundRepository;
import com.theggwp.theggwp_orchestrator_service.source.henrik.HenrikMatchDetailSource;
import com.theggwp.theggwp_orchestrator_service.workflow.Workflow;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowBuilder;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowContext;
import com.theggwp.theggwp_orchestrator_service.workflow.step.ConsumerStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.FetchStep;

import java.util.List;

/**
 * Scheduled job that fetches detailed match information (games and rounds) from Henrik API.
 * This job queries the database for matches that need detailed data and fetches it.
 */
@Component
public class HenrikMatchDetailJob extends ScheduledWorkflowJob<Void, Void> {

    private static final Logger log = LoggerFactory.getLogger(HenrikMatchDetailJob.class);
    
    public static final String JOB_NAME = "henrik-match-details";

    private final JdbcTemplate jdbcTemplate;
    private final HenrikMatchDetailSource source;
    private final HenrikGameRepository gameRepository;
    private final HenrikRoundRepository roundRepository;
    private final RateLimiterRegistry rateLimiterRegistry;

    public HenrikMatchDetailJob(RateLimiterRegistry rateLimiterRegistry,
                                 HenrikMatchDetailSource source,
                                 HenrikGameRepository gameRepository,
                                 HenrikRoundRepository roundRepository,
                                 JdbcTemplate jdbcTemplate) {
        super(rateLimiterRegistry);
        this.source = source;
        this.gameRepository = gameRepository;
        this.roundRepository = roundRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.rateLimiterRegistry = rateLimiterRegistry;
        this.workflow = null; // We'll handle this differently
    }

    private final Workflow<Void, Void> workflow;

    /**
     * Scheduled trigger to fetch match details for recent matches.
     */
    @Scheduled(fixedDelayString = "${henrik.match-detail-poll-interval-ms:600000}")
    public void schedule() {
        // Get list of match IDs that need details (e.g., from last 7 days)
        List<String> matchIds = jdbcTemplate.queryForList(
            "SELECT match_id FROM henrik_matches " +
            "WHERE fetched_at > ? " +
            "ORDER BY fetched_at DESC LIMIT 50",
            String.class,
            Instant.now().getEpochSecond() - (7 * 24 * 60 * 60)
        );

        log.info("Found {} matches to fetch details for", matchIds.size());

        for (String matchId : matchIds) {
            if (!rateLimiterRegistry.get(JOB_NAME).tryAcquire()) {
                log.warn("Rate limit exceeded, stopping match detail fetch");
                break;
            }

            try {
                fetchAndPersistMatchDetails(matchId);
            } catch (Exception e) {
                log.error("Failed to fetch details for match {}", matchId, e);
            }
        }
    }

    private void fetchAndPersistMatchDetails(String matchId) {
        // Set the match ID on the source before building the workflow
        source.setMatchId(matchId);

        Workflow<Void, Void> workflow = WorkflowBuilder.named(JOB_NAME + "-" + matchId)
                .start(new FetchStep<String>(source))
                .then(new ConsumerStep<String>("persist-match-details",
                        json -> persistMatchDetails(json, matchId)))
                .build();

        workflow.run(null);
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

    private void persistMatchDetails(String json, String matchId) {
        try {
            long fetchedAt = Instant.now().getEpochSecond();
            JSONObject response = new JSONObject(json);
            
            // Extract match data
            JSONObject matchData;
            if (response.has("data")) {
                matchData = response.getJSONObject("data");
            } else if (response.has("match")) {
                matchData = response.getJSONObject("match");
            } else {
                matchData = response;
            }

            // Extract and persist games
            if (matchData.has("games")) {
                JSONArray games = matchData.getJSONArray("games");
                persistGames(games, matchId, fetchedAt);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and persist match details for " + matchId + ": " + e.getMessage(), e);
        }
    }

    private void persistGames(JSONArray games, String matchId, long fetchedAt) {
        for (int i = 0; i < games.length(); i++) {
            JSONObject game = games.getJSONObject(i);
            
            String gameId = extractString(game, "gameId", "game_id", "id");
            if (gameId == null) {
                gameId = matchId + "_game_" + i;
            }
            
            String map = extractString(game, "map", "map_name");
            String attackFirstTeam = extractString(game, "attackFirstTeam", "attack_first_team");
            Integer totalTime = game.has("totalTime") ? game.optInt("totalTime") : null;

            gameRepository.upsertGame(
                gameId, matchId, map, attackFirstTeam, totalTime,
                game.toString(), fetchedAt
            );

            // Extract and persist rounds
            if (game.has("rounds")) {
                JSONArray rounds = game.getJSONArray("rounds");
                persistRounds(rounds, gameId, matchId, fetchedAt);
            }
        }
    }

    private void persistRounds(JSONArray rounds, String gameId, String matchId, long fetchedAt) {
        for (int i = 0; i < rounds.length(); i++) {
            JSONObject round = rounds.getJSONObject(i);
            
            int roundNumber = round.optInt("roundNumber", i + 1);
            String roundId = gameId + "_round_" + roundNumber;
            
            String attackTeam = extractString(round, "attackTeam", "attack_team");
            String winType = extractString(round, "winType", "win_type");
            String winningTeam = extractString(round, "winningTeam", "winning_team", "winner");

            roundRepository.upsertRound(
                roundId, gameId, matchId, roundNumber, attackTeam, winType, winningTeam,
                round.toString(), fetchedAt
            );
        }
    }

    /**
     * Helper to extract string from JSON object with multiple possible keys.
     * Handles both string and numeric values by converting to string.
     */
    private static String extractString(JSONObject obj, String... keys) {
        for (String key : keys) {
            if (obj.has(key) && !obj.isNull(key)) {
                Object value = obj.get(key);
                if (value instanceof String) {
                    return (String) value;
                } else if (value instanceof Number) {
                    return String.valueOf(value);
                } else {
                    return value.toString();
                }
            }
        }
        return null;
    }
}
