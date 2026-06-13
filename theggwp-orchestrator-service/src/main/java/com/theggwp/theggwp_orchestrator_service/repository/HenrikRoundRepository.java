package com.theggwp.theggwp_orchestrator_service.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class HenrikRoundRepository {

    private final JdbcTemplate jdbcTemplate;

    public HenrikRoundRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsertRound(String roundId, String gameId, String matchId, int roundNumber,
                             String attackTeam, String winType, String winningTeam, 
                             String json, long fetchedAt) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_rounds(" +
            "round_id, game_id, match_id, round_number, attack_team, win_type, winning_team, json, fetched_at) " +
            "VALUES(?,?,?,?,?,?,?,?,?)",
            roundId, gameId, matchId, roundNumber, attackTeam, winType, winningTeam, json, fetchedAt
        );
    }

    public List<String> findRoundsByGameId(String gameId) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_rounds WHERE game_id = ? ORDER BY round_number ASC",
            new Object[]{gameId},
            String.class
        );
    }

    public Optional<String> findRoundById(String roundId) {
        var list = jdbcTemplate.queryForList(
            "SELECT json FROM henrik_rounds WHERE round_id = ?",
            new Object[]{roundId},
            String.class
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<String> findRoundByNumber(String gameId, int roundNumber) {
        var list = jdbcTemplate.queryForList(
            "SELECT json FROM henrik_rounds WHERE game_id = ? AND round_number = ?",
            new Object[]{gameId, roundNumber},
            String.class
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<String> findRoundsByMatchId(String matchId) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_rounds WHERE match_id = ? ORDER BY game_id, round_number ASC",
            new Object[]{matchId},
            String.class
        );
    }
}
