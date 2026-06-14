package com.theggwp.theggwp_orchestrator_service.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.theggwp.theggwp_orchestrator_service.job.ScheduledWorkflowJob;

/**
 * Aggregated smoke-test endpoint: <b>GET /smoke</b>.
 *
 * <p>Reports overall status together with dependency (DB) reachability and the latest run
 * status of every registered {@link ScheduledWorkflowJob}. Intended to be hit by post-deploy
 * smoke tests. As new jobs are added they automatically appear here (they are injected as a
 * list of all {@code ScheduledWorkflowJob} beans).</p>
 */
@RestController
public class SmokeController {

    private final JdbcTemplate jdbcTemplate;
    private final List<ScheduledWorkflowJob<?, ?>> jobs;

    public SmokeController(JdbcTemplate jdbcTemplate, List<ScheduledWorkflowJob<?, ?>> jobs) {
        this.jdbcTemplate = jdbcTemplate;
        this.jobs = jobs;
    }

    @GetMapping("/smoke")
    public ResponseEntity<Map<String, Object>> smoke() {
        boolean dbUp = HealthController.isDatabaseReachable(jdbcTemplate);

        List<Map<String, Object>> jobStatuses = new ArrayList<>();
        for (ScheduledWorkflowJob<?, ?> job : jobs) {
            Map<String, Object> status = new LinkedHashMap<>();
            status.put("name", job.name());
            status.put("hasEverRun", job.hasEverRun());
            status.put("lastRunSuccessful", job.isLastRunSuccessful());
            status.put("lastRunAt", job.getLastRunAt());
            status.put("lastError", job.getLastError());
            jobStatuses.add(status);
        }

        boolean ok = dbUp;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", ok ? "UP" : "DOWN");
        body.put("database", dbUp ? "UP" : "DOWN");
        body.put("jobs", jobStatuses);

        return ok
                ? ResponseEntity.ok(body)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }
}
