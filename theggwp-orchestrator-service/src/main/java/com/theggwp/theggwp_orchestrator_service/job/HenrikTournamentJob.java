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
 * Scheduled job that fetches esports schedule from Henrik API and stores tournaments/matches in the database.
 * 
 * Henrik API returns schedule items with:
 * - state: "completed", "unstarted", "inProgress"
 * - league: tournament/league info with region
 * - match: match details with teams, scores, game type
 * 
 * The pipeline:
 * fetch (Void -> String JSON)
 *   -> parse and persist schedule (String -> Void)
 */
@Component
public class HenrikTournamentJob extends ScheduledWorkflowJob<Void, Void> {

    public static final String JOB_NAME = "henrik-schedule";

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
            
            // Henrik schedule API returns: { status: 200, data: [...schedule items...] }
            if (!response.has("data")) {
                throw new IllegalArgumentException("Henrik API response missing 'data' field");
            }
            
            JSONArray scheduleItems = response.getJSONArray("data");
            
            // Group schedule items by tournament to avoid duplicates
            java.util.Map<String, JSONObject> tournaments = new java.util.HashMap<>();
            java.util.Map<String, java.util.List<JSONObject>> tournamentMatches = new java.util.HashMap<>();
            
            for (int i = 0; i < scheduleItems.length(); i++) {
                JSONObject item = scheduleItems.getJSONObject(i);
                
                // Extract tournament/league info
                JSONObject league = item.optJSONObject("league");
                JSONObject tournament = item.optJSONObject("tournament");
                
                if (league == null || tournament == null) {
                    continue; // Skip items without league/tournament info
                }
                
                // Use tournament name as ID (or combination of league + tournament)
                String tournamentName = tournament.optString("name");
                String leagueName = league.optString("name");
                String tournamentId = tournamentName != null ? tournamentName : leagueName;
                
                if (tournamentId == null) {
                    continue;
                }
                
                // Build tournament object if not already seen
                if (!tournaments.containsKey(tournamentId)) {
                    JSONObject tournamentData = new JSONObject();
                    tournamentData.put("id", tournamentId);
                    tournamentData.put("name", leagueName);
                    tournamentData.put("tournament_name", tournamentName);
                    tournamentData.put("season", tournament.optString("season", ""));
                    tournamentData.put("region", league.optString("region", ""));
                    tournamentData.put("icon", league.optString("icon", ""));
                    tournamentData.put("identifier", league.optString("identifier", ""));
                    tournaments.put(tournamentId, tournamentData);
                    tournamentMatches.put(tournamentId, new java.util.ArrayList<>());
                }
                
                // Extract match if present
                if (item.has("match") && !item.isNull("match")) {
                    JSONObject matchData = item.getJSONObject("match");
                    matchData.put("date", item.optString("date"));
                    matchData.put("state", item.optString("state")); // completed, unstarted, inProgress
                    matchData.put("vod", item.optString("vod"));
                    tournamentMatches.get(tournamentId).add(matchData);
                }
            }
            
            // Persist all tournaments and their matches
            for (java.util.Map.Entry<String, JSONObject> entry : tournaments.entrySet()) {
                String tournamentId = entry.getKey();
                JSONObject tournamentData = entry.getValue();
                
                String name = extractString(tournamentData, "name");
                String region = extractString(tournamentData, "region");
                String season = extractString(tournamentData, "season");
                
                // Determine if VCT based on league identifier or name
                String identifier = extractString(tournamentData, "identifier");
                boolean vct = identifier != null && (
                    identifier.contains("vct") || 
                    identifier.contains("masters") || 
                    identifier.contains("champions") ||
                    identifier.contains("lock_in")
                );
                
                // Determine tournament state from its matches
                java.util.List<JSONObject> matches = tournamentMatches.get(tournamentId);
                boolean hasLive = false;
                boolean hasUpcoming = false;
                boolean allFinished = !matches.isEmpty();
                
                for (JSONObject match : matches) {
                    String state = match.optString("state");
                    if ("inProgress".equals(state)) {
                        hasLive = true;
                        allFinished = false;
                    } else if ("unstarted".equals(state)) {
                        hasUpcoming = true;
                        allFinished = false;
                    }
                }
                
                // Store tournament
                tournamentRepo.upsertTournament(
                    tournamentId, name, null, region, null, vct, hasLive, hasUpcoming, allFinished,
                    tournamentData.toString(), fetchedAt, null
                );
                
                // Store matches
                if (!matches.isEmpty()) {
                    persistMatchList(matches, tournamentId, matchRepo, fetchedAt);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and persist schedule: " + e.getMessage(), e);
        }
    }

    private static void persistMatchList(java.util.List<JSONObject> matches, String tournamentId, 
                                          HenrikMatchRepository matchRepo, long fetchedAt) {
        for (JSONObject match : matches) {
            String matchId = extractString(match, "id");
            String date = extractString(match, "date");
            String state = extractString(match, "state"); // completed, unstarted, inProgress
            
            // Determine if live
            boolean live = "inProgress".equals(state);
            
            // Extract game type info (bestOf/playAll)
            JSONObject gameType = match.optJSONObject("game_type");
            String matchFormat = null;
            if (gameType != null) {
                String type = gameType.optString("type"); // "bestOf" or "playAll"
                int count = gameType.optInt("count", 0);
                if ("bestOf".equals(type) && count > 0) {
                    matchFormat = "BO" + count;
                } else if ("playAll".equals(type)) {
                    matchFormat = "PlayAll";
                }
            }

            // Extract team information
            JSONArray teams = match.optJSONArray("teams");
            String team1Name = null, team2Name = null;
            Integer team1Score = null, team2Score = null;
            Boolean team1Winner = null, team2Winner = null;

            if (teams != null && teams.length() >= 2) {
                JSONObject team1 = teams.getJSONObject(0);
                JSONObject team2 = teams.getJSONObject(1);
                
                team1Name = extractString(team1, "name");
                team2Name = extractString(team2, "name");
                team1Score = team1.has("game_wins") ? team1.optInt("game_wins") : null;
                team2Score = team2.has("game_wins") ? team2.optInt("game_wins") : null;
                team1Winner = team1.has("has_won") ? team1.optBoolean("has_won") : null;
                team2Winner = team2.has("has_won") ? team2.optBoolean("has_won") : null;
            }

            if (matchId != null) {
                matchRepo.upsertMatch(
                    matchId, tournamentId, date, matchFormat, live, null, null,
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
