package com.theggwp.theggwp_orchestrator_service.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Kubernetes-style probe endpoints.
 *
 * <ul>
 *   <li><b>GET /health/liveness</b> - liveness probe; always UP if the process is serving.</li>
 *   <li><b>GET /health/readiness</b> - readiness probe; UP only when dependencies (DB) are reachable.</li>
 * </ul>
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/liveness")
    public ResponseEntity<Map<String, Object>> liveness() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/readiness")
    public ResponseEntity<Map<String, Object>> readiness() {
        boolean dbUp = isDatabaseReachable(jdbcTemplate);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", dbUp ? "UP" : "DOWN");
        body.put("checks", Map.of("database", dbUp ? "UP" : "DOWN"));
        return dbUp
                ? ResponseEntity.ok(body)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    static boolean isDatabaseReachable(JdbcTemplate jdbcTemplate) {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
