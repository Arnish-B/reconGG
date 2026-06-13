package com.theggwp.theggwp_orchestrator_service.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class HenrikGameRepository {

    private final JdbcTemplate jdbcTemplate;

    public HenrikGameRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsertGame(String gameId, String matchId, String map, String attackFirstTeam,
                            Integer totalTime, String json, long fetchedAt) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_games(" +
            "game_id, match_id, map, attack_first_team, total_time, json, fetched_at) " +
            "VALUES(?,?,?,?,?,?,?)",
            gameId, matchId, map, attackFirstTeam, totalTime, json, fetchedAt
        );
    }

    public List<String> findGamesByMatchId(String matchId) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_games WHERE match_id = ? ORDER BY game_id ASC",
            new Object[]{matchId},
            String.class
        );
    }

    public Optional<String> findGameById(String gameId) {
        var list = jdbcTemplate.queryForList(
            "SELECT json FROM henrik_games WHERE game_id = ?",
            new Object[]{gameId},
            String.class
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<String> findGamesByMap(String matchId, String map) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_games WHERE match_id = ? AND map = ?",
            new Object[]{matchId, map},
            String.class
        );
    }
}
