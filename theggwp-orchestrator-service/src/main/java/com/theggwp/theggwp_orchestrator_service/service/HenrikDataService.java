package com.theggwp.theggwp_orchestrator_service.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.theggwp.theggwp_orchestrator_service.repository.HenrikTournamentRepository;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikMatchRepository;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikGameRepository;
import com.theggwp.theggwp_orchestrator_service.repository.HenrikRoundRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Henrik API data.
 * Provides business logic and data transformation for the API endpoints.
 */
@Service
public class HenrikDataService {

    private final HenrikTournamentRepository tournamentRepository;
    private final HenrikMatchRepository matchRepository;
    private final HenrikGameRepository gameRepository;
    private final HenrikRoundRepository roundRepository;

    public HenrikDataService(HenrikTournamentRepository tournamentRepository,
                              HenrikMatchRepository matchRepository,
                              HenrikGameRepository gameRepository,
                              HenrikRoundRepository roundRepository) {
        this.tournamentRepository = tournamentRepository;
        this.matchRepository = matchRepository;
        this.gameRepository = gameRepository;
        this.roundRepository = roundRepository;
    }

    // ===== Tournament Operations =====

    public String getAllTournaments(String region, String tier, Boolean vct, Boolean live, 
                                     Boolean upcoming, Boolean finished) {
        List<String> tournaments;

        // Apply filters
        if (live != null && live) {
            tournaments = tournamentRepository.findLiveTournaments();
        } else if (upcoming != null && upcoming) {
            tournaments = tournamentRepository.findUpcomingTournaments();
        } else if (finished != null && finished) {
            tournaments = tournamentRepository.findFinishedTournaments();
        } else if (vct != null && vct) {
            tournaments = tournamentRepository.findVCTTournaments();
        } else if (region != null) {
            tournaments = tournamentRepository.findTournamentsByRegion(region);
        } else if (tier != null) {
            tournaments = tournamentRepository.findTournamentsByTier(tier);
        } else {
            tournaments = tournamentRepository.findAllTournaments();
        }

        return wrapInTournamentsArray(tournaments);
    }

    public String getTournamentById(String tournamentId) {
        Optional<String> tournament = tournamentRepository.findTournamentById(tournamentId);
        return tournament.orElse("{}");
    }

    // ===== Match Operations =====

    public String getMatchesForTournament(String tournamentId, String bracket, Integer week) {
        List<String> matches;

        if (bracket != null) {
            matches = matchRepository.findMatchesByBracket(tournamentId, bracket);
        } else if (week != null) {
            matches = matchRepository.findMatchesByWeek(tournamentId, week);
        } else {
            matches = matchRepository.findMatchesByTournamentId(tournamentId);
        }

        return wrapInMatchesArray(matches);
    }

    public String getMatchById(String tournamentId, String matchId) {
        Optional<String> match = matchRepository.findMatchById(matchId);
        
        if (match.isEmpty()) {
            return "{}";
        }

        // Enrich match with games data
        try {
            JSONObject matchObj = new JSONObject(match.get());
            JSONObject enrichedMatch = enrichMatchWithGames(matchObj, matchId);
            
            JSONObject wrapper = new JSONObject();
            wrapper.put("match", enrichedMatch);
            return wrapper.toString();
        } catch (Exception e) {
            return match.get();
        }
    }

    public String getLiveMatches() {
        List<String> matches = matchRepository.findLiveMatches();
        return wrapInMatchesArray(matches);
    }

    // ===== Game Operations =====

    public String getGamesForMatch(String matchId) {
        List<String> games = gameRepository.findGamesByMatchId(matchId);
        return wrapInGamesArray(games);
    }

    public String getGameById(String tournamentId, String matchId, String gameId) {
        Optional<String> game = gameRepository.findGameById(gameId);
        
        if (game.isEmpty()) {
            return "{}";
        }

        // Enrich game with rounds data
        try {
            JSONObject gameObj = new JSONObject(game.get());
            JSONObject enrichedGame = enrichGameWithRounds(gameObj, gameId);
            
            JSONObject wrapper = new JSONObject();
            wrapper.put("game", enrichedGame);
            return wrapper.toString();
        } catch (Exception e) {
            return game.get();
        }
    }

    // ===== Round Operations =====

    public String getRoundsForGame(String gameId) {
        List<String> rounds = roundRepository.findRoundsByGameId(gameId);
        return wrapInRoundsArray(rounds);
    }

    public String getRoundByNumber(String tournamentId, String matchId, String gameId, int roundNumber) {
        Optional<String> round = roundRepository.findRoundByNumber(gameId, roundNumber);
        
        if (round.isEmpty()) {
            return "{}";
        }

        try {
            JSONObject roundObj = new JSONObject(round.get());
            JSONObject wrapper = new JSONObject();
            wrapper.put("round", roundObj);
            return wrapper.toString();
        } catch (Exception e) {
            return round.get();
        }
    }

    // ===== Helper Methods =====

    private JSONObject enrichMatchWithGames(JSONObject match, String matchId) {
        List<String> gamesJson = gameRepository.findGamesByMatchId(matchId);
        
        if (!gamesJson.isEmpty()) {
            JSONArray gamesArray = new JSONArray();
            for (String gameJson : gamesJson) {
                try {
                    JSONObject gameObj = new JSONObject(gameJson);
                    gamesArray.put(gameObj);
                } catch (Exception e) {
                    // Skip malformed game data
                }
            }
            match.put("games", gamesArray);
        }
        
        return match;
    }

    private JSONObject enrichGameWithRounds(JSONObject game, String gameId) {
        List<String> roundsJson = roundRepository.findRoundsByGameId(gameId);
        
        if (!roundsJson.isEmpty()) {
            JSONArray roundsArray = new JSONArray();
            for (String roundJson : roundsJson) {
                try {
                    JSONObject roundObj = new JSONObject(roundJson);
                    roundsArray.put(roundObj);
                } catch (Exception e) {
                    // Skip malformed round data
                }
            }
            game.put("rounds", roundsArray);
        }
        
        return game;
    }

    private String wrapInTournamentsArray(List<String> jsonStrings) {
        if (jsonStrings.isEmpty()) {
            return "{\"tournaments\":[]}";
        }

        try {
            JSONArray array = new JSONArray();
            for (String json : jsonStrings) {
                array.put(new JSONObject(json));
            }
            JSONObject wrapper = new JSONObject();
            wrapper.put("tournaments", array);
            return wrapper.toString();
        } catch (Exception e) {
            return "{\"tournaments\":[]}";
        }
    }

    private String wrapInMatchesArray(List<String> jsonStrings) {
        if (jsonStrings.isEmpty()) {
            return "{\"matches\":[]}";
        }

        try {
            JSONArray array = new JSONArray();
            for (String json : jsonStrings) {
                array.put(new JSONObject(json));
            }
            JSONObject wrapper = new JSONObject();
            wrapper.put("matches", array);
            return wrapper.toString();
        } catch (Exception e) {
            return "{\"matches\":[]}";
        }
    }

    private String wrapInGamesArray(List<String> jsonStrings) {
        if (jsonStrings.isEmpty()) {
            return "{\"games\":[]}";
        }

        try {
            JSONArray array = new JSONArray();
            for (String json : jsonStrings) {
                array.put(new JSONObject(json));
            }
            JSONObject wrapper = new JSONObject();
            wrapper.put("games", array);
            return wrapper.toString();
        } catch (Exception e) {
            return "{\"games\":[]}";
        }
    }

    private String wrapInRoundsArray(List<String> jsonStrings) {
        if (jsonStrings.isEmpty()) {
            return "{\"rounds\":[]}";
        }

        try {
            JSONArray array = new JSONArray();
            for (String json : jsonStrings) {
                array.put(new JSONObject(json));
            }
            JSONObject wrapper = new JSONObject();
            wrapper.put("rounds", array);
            return wrapper.toString();
        } catch (Exception e) {
            return "{\"rounds\":[]}";
        }
    }
}
