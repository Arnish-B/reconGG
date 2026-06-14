package com.theggwp.theggwp_orchestrator_service.ratelimit;

/**
 * Simple permit-based rate limiter abstraction used to throttle how often a scheduled job
 * (or a data source pull) is allowed to run.
 */
public interface RateLimiter {

    /**
     * The name this limiter is registered under (matches a key under {@code ratelimit.limits.*}).
     */
    String name();

    /**
     * Attempts to acquire a permit without blocking.
     *
     * @return {@code true} if a permit was granted, {@code false} if the call should be skipped
     */
    boolean tryAcquire();
}
