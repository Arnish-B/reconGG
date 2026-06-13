package com.theggwp.theggwp_orchestrator_service.ratelimit;

/**
 * Thread-safe token-bucket {@link RateLimiter}.
 *
 * <p>Allows up to {@code permits} acquisitions per {@code periodMillis}. Tokens refill
 * continuously based on elapsed time, so bursts up to the bucket capacity are permitted while
 * the long-run average is capped at {@code permits / period}.</p>
 */
public class TokenBucketRateLimiter implements RateLimiter {

    private final String name;
    private final long capacity;
    private final double refillTokensPerMilli;

    private double availableTokens;
    private long lastRefillTimestamp;

    public TokenBucketRateLimiter(String name, long permits, long periodMillis) {
        if (permits <= 0) {
            throw new IllegalArgumentException("permits must be > 0 for limiter '" + name + "'");
        }
        if (periodMillis <= 0) {
            throw new IllegalArgumentException("periodMs must be > 0 for limiter '" + name + "'");
        }
        this.name = name;
        this.capacity = permits;
        this.refillTokensPerMilli = (double) permits / (double) periodMillis;
        this.availableTokens = permits;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public synchronized boolean tryAcquire() {
        refill();
        if (availableTokens >= 1.0d) {
            availableTokens -= 1.0d;
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastRefillTimestamp;
        if (elapsed > 0) {
            availableTokens = Math.min(capacity, availableTokens + elapsed * refillTokensPerMilli);
            lastRefillTimestamp = now;
        }
    }
}
