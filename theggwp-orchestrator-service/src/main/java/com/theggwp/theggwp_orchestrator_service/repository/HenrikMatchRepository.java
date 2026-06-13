package com.theggwp.theggwp_orchestrator_service.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class HenrikMatchRepository {

    private final JdbcTemplate jdbcTemplate;

    public HenrikMatchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsertMatch(String matchId, String tournamentId, String date, String matchFormat,
                             boolean live, String bracket, Integer week, String team1Name, 
                             Integer team1Score, Boolean team1Winner, String team2Name, 
                             Integer team2Score, Boolean team2Winner, String json, long fetchedAt) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_matches(" +
            "match_id, tournament_id, date, match_format, live, bracket, week, " +
            "team1_name, team1_score, team1_winner, team2_name, team2_score, team2_winner, " +
            "json, fetched_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            matchId, tournamentId, date, matchFormat, live, bracket, week,
            team1Name, team1Score, team1Winner, team2Name, team2Score, team2Winner,
            json, fetchedAt
        );
    }

    public void upsertMatchJson(String matchId, String json, long fetchedAt) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_matches(match_id, json, fetched_at) " +
            "SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM henrik_matches WHERE match_id = ?) " +
            "UNION ALL " +
            "SELECT match_id, ?, ? FROM henrik_matches WHERE match_id = ?",
            matchId, json, fetchedAt, matchId, json, fetchedAt, matchId
        );
    }

    public List<String> findMatchesByTournamentId(String tournamentId) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_matches WHERE tournament_id = ? ORDER BY date ASC",
            new Object[]{tournamentId},
            String.class
        );
    }

    public Optional<String> findMatchById(String matchId) {
        var list = jdbcTemplate.queryForList(
            "SELECT json FROM henrik_matches WHERE match_id = ?",
            new Object[]{matchId},
            String.class
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<String> findLiveMatches() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_matches WHERE live = true ORDER BY date ASC",
            String.class
        );
    }

    public List<String> findMatchesByBracket(String tournamentId, String bracket) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_matches WHERE tournament_id = ? AND bracket = ? ORDER BY date ASC",
            new Object[]{tournamentId, bracket},
            String.class
        );
    }

    public List<String> findMatchesByWeek(String tournamentId, int week) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_matches WHERE tournament_id = ? AND week = ? ORDER BY date ASC",
            new Object[]{tournamentId, week},
            String.class
        );
    }
}
