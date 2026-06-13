package com.theggwp.theggwp_orchestrator_service.ratelimit;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalised, per-name rate-limit configuration.
 *
 * <p>Example (application.properties):</p>
 * <pre>
 * ratelimit.enabled=true
 * ratelimit.limits.pandascore-tournaments.permits=5
 * ratelimit.limits.pandascore-tournaments.period-ms=1000
 * </pre>
 *
 * Each key under {@code ratelimit.limits.*} corresponds to a job / data-source name.
 */
@ConfigurationProperties(prefix = "ratelimit")
public class RateLimitProperties {

    /** Master switch. When false all limiters become no-ops. */
    private boolean enabled = true;

    /** Named limits keyed by job/source name. */
    private Map<String, Limit> limits = new HashMap<>();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Map<String, Limit> getLimits() {
        return limits;
    }

    public void setLimits(Map<String, Limit> limits) {
        this.limits = limits;
    }

    /**
     * A single named limit: at most {@code permits} executions per {@code periodMs}.
     */
    public static class Limit {
        private long permits = 10;
        private long periodMs = 1000;

        public long getPermits() {
            return permits;
        }

        public void setPermits(long permits) {
            this.permits = permits;
        }

        public long getPeriodMs() {
            return periodMs;
        }

        public void setPeriodMs(long periodMs) {
            this.periodMs = periodMs;
        }
    }
}
