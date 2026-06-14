package com.theggwp.theggwp_orchestrator_service.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class TournamentRepository {

    private final JdbcTemplate jdbcTemplate;

    public TournamentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsertLatest(String json, long fetchedAt) {
        jdbcTemplate.update("INSERT OR REPLACE INTO tournaments(id,name,json,fetched_at) VALUES(?,?,?,?)",
                "latest","pandascore_tournaments", json, fetchedAt);
    }

    public Optional<String> findLatest() {
        var list = jdbcTemplate.queryForList("SELECT json FROM tournaments WHERE id = ?", new Object[]{"latest"}, String.class);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
