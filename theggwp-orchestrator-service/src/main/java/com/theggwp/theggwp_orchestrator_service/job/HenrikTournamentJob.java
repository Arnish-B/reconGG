package com.theggwp.theggwp_orchestrator_service.job;

import java.time.Instant;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiterRegistry;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikTournamentRepository;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikMatchRepository;
import com.theggwp.theggwp_orchestrator_service.source.henrik.HenrikTournamentSource;
import com.theggwp.theggwp_orchestrator_service.workflow.Workflow;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowBuilder;
import com.theggwp.theggwp_orchestrator_service.workflow.step.ConsumerStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.FetchStep;
import com.theggwp.theggwp_orchestrator_service.workflow.step.TransformStep;

/**
 * Scheduled job that fetches tournaments/events from Henrik API and stores them in the database.
 * 
 * The pipeline:
 * fetch (Void -> String JSON)
 *   -> parse and persist tournaments (String -> Void)
 */
@Component
public class HenrikTournamentJob extends ScheduledWorkflowJob<Void, Void> {

    public static final String JOB_NAME = "henrik-tournaments";

    private final Workflow<Void, Void> workflow;

    public HenrikTournamentJob(RateLimiterRegistry rateLimiterRegistry,
                                HenrikTournamentSource source,
                                HenrikTournamentRepository tournamentRepository,
                                HenrikMatchRepository matchRepository) {
        super(rateLimiterRegistry);
        this.workflow = WorkflowBuilder.named(JOB_NAME)
                .start(new FetchStep<String>(source))
                .then(new TransformStep<String, String>("validate-response", 
                        HenrikTournamentJob::validateAndReturnJson))
                .then(new ConsumerStep<String>("persist-tournaments",
                        json -> persistTournaments(json, tournamentRepository, matchRepository)))
                .build();
    }

    /**
     * Scheduled trigger. Interval is configured via {@code henrik.poll-interval-ms}.
     */
    @Scheduled(fixedDelayString = "${henrik.poll-interval-ms:300000}")
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

    private static String validateAndReturnJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            throw new IllegalArgumentException("Empty response from Henrik API");
        }
        return json;
    }

    private static void persistTournaments(String json, HenrikTournamentRepository tournamentRepo, 
                                            HenrikMatchRepository matchRepo) {
        try {
            long fetchedAt = Instant.now().getEpochSecond();
            JSONObject response = new JSONObject(json);
            
            // Check if response has 'data' field (common pattern in Henrik API)
            JSONArray tournaments;
            if (response.has("data")) {
                Object dataObj = response.get("data");
                if (dataObj instanceof JSONArray) {
                    tournaments = (JSONArray) dataObj;
                } else if (dataObj instanceof JSONObject) {
                    // Single tournament wrapped in data
                    tournaments = new JSONArray();
                    tournaments.put(dataObj);
                } else {
                    tournaments = new JSONArray();
                }
            } else if (response.has("segments")) {
                // Alternative structure
                tournaments = response.getJSONArray("segments");
            } else {
                // Assume the whole response is the array
                if (json.trim().startsWith("[")) {
                    tournaments = new JSONArray(json);
                } else {
                    tournaments = new JSONArray();
                    tournaments.put(response);
                }
            }

            for (int i = 0; i < tournaments.length(); i++) {
                JSONObject tournament = tournaments.getJSONObject(i);
                
                // Extract tournament fields
                String tournamentId = extractString(tournament, "id", "tournament_id", "eventId", "event_id");
                String name = extractString(tournament, "name", "title", "event_name");
                String date = extractString(tournament, "date", "start_date", "startDate", "dates");
                String region = extractString(tournament, "region", "location");
                String tier = extractString(tournament, "tier", "priority");
                boolean vct = tournament.optBoolean("vct", false);
                boolean live = tournament.optBoolean("live", false);
                boolean upcoming = tournament.optBoolean("upcoming", false);
                boolean finished = tournament.optBoolean("finished", false);
                String lastRefreshed = tournament.optString("lastRefreshed", null);

                // Store tournament
                if (tournamentId != null) {
                    tournamentRepo.upsertTournament(
                        tournamentId, name, date, region, tier, vct, live, upcoming, finished,
                        tournament.toString(), fetchedAt, lastRefreshed
                    );

                    // Extract and store embedded matches if present
                    if (tournament.has("matches")) {
                        JSONArray matches = tournament.getJSONArray("matches");
                        persistMatches(matches, tournamentId, matchRepo, fetchedAt);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and persist tournaments: " + e.getMessage(), e);
        }
    }

    private static void persistMatches(JSONArray matches, String tournamentId, 
                                        HenrikMatchRepository matchRepo, long fetchedAt) {
        for (int i = 0; i < matches.length(); i++) {
            JSONObject match = matches.getJSONObject(i);
            
            String matchId = extractString(match, "matchId", "match_id", "id");
            String date = extractString(match, "date", "start_time", "startTime");
            String matchFormat = extractString(match, "matchFormat", "match_format", "format", "bestOf");
            boolean live = match.optBoolean("live", false);
            String bracket = extractString(match, "bracket", "stage", "round");
            Integer week = match.has("week") ? match.optInt("week") : null;

            // Extract team information
            JSONArray teams = match.optJSONArray("teams");
            String team1Name = null, team2Name = null;
            Integer team1Score = null, team2Score = null;
            Boolean team1Winner = null, team2Winner = null;

            if (teams != null && teams.length() >= 2) {
                JSONObject team1 = teams.getJSONObject(0);
                JSONObject team2 = teams.getJSONObject(1);
                
                team1Name = extractString(team1, "name", "team_name");
                team2Name = extractString(team2, "name", "team_name");
                team1Score = team1.has("score") ? team1.optInt("score") : null;
                team2Score = team2.has("score") ? team2.optInt("score") : null;
                team1Winner = team1.has("winner") ? team1.optBoolean("winner") : null;
                team2Winner = team2.has("winner") ? team2.optBoolean("winner") : null;
            }

            if (matchId != null) {
                matchRepo.upsertMatch(
                    matchId, tournamentId, date, matchFormat, live, bracket, week,
                    team1Name, team1Score, team1Winner, team2Name, team2Score, team2Winner,
                    match.toString(), fetchedAt
                );
            }
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
