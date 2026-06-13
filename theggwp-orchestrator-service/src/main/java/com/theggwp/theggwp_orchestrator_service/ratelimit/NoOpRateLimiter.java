package com.theggwp.theggwp_orchestrator_service.ratelimit;

/**
 * {@link RateLimiter} that never throttles. Used when rate limiting is globally disabled or when
 * no explicit limit is configured for a given name.
 */
public class NoOpRateLimiter implements RateLimiter {

    private final String name;

    public NoOpRateLimiter(String name) {
        this.name = name;
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public boolean tryAcquire() {
        return true;
    }
}
