package com.theggwp.theggwp_orchestrator_service.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class HenrikTournamentRepository {

    private final JdbcTemplate jdbcTemplate;

    public HenrikTournamentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsertTournament(String tournamentId, String name, String date, String region, 
                                  String tier, boolean vct, boolean live, boolean upcoming, 
                                  boolean finished, String json, long fetchedAt, String lastRefreshed) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_tournaments(" +
            "tournament_id, name, date, region, tier, vct, live, upcoming, finished, json, fetched_at, last_refreshed) " +
            "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            tournamentId, name, date, region, tier, vct, live, upcoming, finished, json, fetchedAt, lastRefreshed
        );
    }

    public void upsertTournamentJson(String tournamentId, String json, long fetchedAt) {
        jdbcTemplate.update(
            "INSERT OR REPLACE INTO henrik_tournaments(tournament_id, json, fetched_at) " +
            "SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM henrik_tournaments WHERE tournament_id = ?) " +
            "UNION ALL " +
            "SELECT tournament_id, ?, ? FROM henrik_tournaments WHERE tournament_id = ?",
            tournamentId, json, fetchedAt, tournamentId, json, fetchedAt, tournamentId
        );
    }

    public List<String> findAllTournaments() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments ORDER BY fetched_at DESC", 
            String.class
        );
    }

    public Optional<String> findTournamentById(String tournamentId) {
        var list = jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE tournament_id = ?", 
            new Object[]{tournamentId}, 
            String.class
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<String> findTournamentsByRegion(String region) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE region = ? ORDER BY fetched_at DESC",
            new Object[]{region},
            String.class
        );
    }

    public List<String> findTournamentsByTier(String tier) {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE tier = ? ORDER BY fetched_at DESC",
            new Object[]{tier},
            String.class
        );
    }

    public List<String> findLiveTournaments() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE live = true ORDER BY fetched_at DESC",
            String.class
        );
    }

    public List<String> findUpcomingTournaments() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE upcoming = true ORDER BY date ASC",
            String.class
        );
    }

    public List<String> findFinishedTournaments() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE finished = true ORDER BY date DESC",
            String.class
        );
    }

    public List<String> findVCTTournaments() {
        return jdbcTemplate.queryForList(
            "SELECT json FROM henrik_tournaments WHERE vct = true ORDER BY fetched_at DESC",
            String.class
        );
    }
}
