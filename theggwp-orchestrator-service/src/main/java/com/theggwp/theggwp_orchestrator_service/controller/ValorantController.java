package com.theggwp.theggwp_orchestrator_service.controller;

import com.theggwp.theggwp_orchestrator_service.service.HenrikDataService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller implementing the VLR.gg API specification.
 * Provides endpoints for tournaments, matches, games, and rounds.
 * 
 * All endpoints return JSON data fetched from Henrik API and stored locally.
 */
@RestController
@RequestMapping("/tournaments")
public class ValorantController {

    private final HenrikDataService henrikDataService;

    public ValorantController(HenrikDataService henrikDataService) {
        this.henrikDataService = henrikDataService;
    }

    /**
     * GET /tournaments
     * List tournaments with optional filters
     * 
     * Query Parameters:
     * - region: Filter by region (na, eu, apac, kr, cn, sa, oce, mn)
     * - tier: Filter by tier (s, a, b, c, d, unranked)
     * - vct: Only VCT-sanctioned events (boolean)
     * - live: Currently in progress (boolean)
     * - upcoming: Scheduled but not started (boolean)
     * - finished: Completed events (boolean)
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String listTournaments(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) Boolean vct,
            @RequestParam(required = false) Boolean live,
            @RequestParam(required = false) Boolean upcoming,
            @RequestParam(required = false) Boolean finished) {
        
        return henrikDataService.getAllTournaments(region, tier, vct, live, upcoming, finished);
    }

    /**
     * GET /tournaments/{tournamentId}
     * Get a specific tournament by ID
     */
    @GetMapping(value = "/{tournamentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getTournament(@PathVariable String tournamentId) {
        return henrikDataService.getTournamentById(tournamentId);
    }

    /**
     * GET /tournaments/{tournamentId}/matches
     * List all matches in a tournament with optional filters
     * 
     * Query Parameters:
     * - bracket: Filter by bracket stage (group_stage, quarterfinal, semifinal, final, grand_final)
     * - week: Filter by week number
     */
    @GetMapping(value = "/{tournamentId}/matches", produces = MediaType.APPLICATION_JSON_VALUE)
    public String listMatchesInTournament(
            @PathVariable String tournamentId,
            @RequestParam(required = false) String bracket,
            @RequestParam(required = false) Integer week) {
        
        return henrikDataService.getMatchesForTournament(tournamentId, bracket, week);
    }

    /**
     * GET /tournaments/{tournamentId}/matches/{matchId}
     * Get detailed match information including games
     */
    @GetMapping(value = "/{tournamentId}/matches/{matchId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getMatchDetail(
            @PathVariable String tournamentId,
            @PathVariable String matchId) {
        
        return henrikDataService.getMatchById(tournamentId, matchId);
    }

    /**
     * GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}
     * Get detailed game information including rounds
     */
    @GetMapping(value = "/{tournamentId}/matches/{matchId}/games/{gameId}", 
                produces = MediaType.APPLICATION_JSON_VALUE)
    public String getGameDetail(
            @PathVariable String tournamentId,
            @PathVariable String matchId,
            @PathVariable String gameId) {
        
        return henrikDataService.getGameById(tournamentId, matchId, gameId);
    }

    /**
     * GET /tournaments/{tournamentId}/matches/{matchId}/games/{gameId}/rounds/{roundNumber}
     * Get detailed round information including player stats
     */
    @GetMapping(value = "/{tournamentId}/matches/{matchId}/games/{gameId}/rounds/{roundNumber}", 
                produces = MediaType.APPLICATION_JSON_VALUE)
    public String getRoundDetail(
            @PathVariable String tournamentId,
            @PathVariable String matchId,
            @PathVariable String gameId,
            @PathVariable int roundNumber) {
        
        return henrikDataService.getRoundByNumber(tournamentId, matchId, gameId, roundNumber);
    }

    /**
     * GET /matches/live
     * Get all currently live matches across all tournaments
     */
    @GetMapping(value = "/live", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getLiveMatches() {
        return henrikDataService.getLiveMatches();
    }
}
