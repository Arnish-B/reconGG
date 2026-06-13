package com.theggwp.theggwp_orchestrator_service.ratelimit;

import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Central factory/cache for {@link RateLimiter} instances.
 *
 * <p>Limiters are created lazily and cached per name. The configuration for each name is read
 * from {@link RateLimitProperties} (i.e. {@code application.properties}), so throttling can be
 * tuned per job/source without code changes. If rate limiting is globally disabled, or a name has
 * no configured limit, a {@link NoOpRateLimiter} is returned.</p>
 */
@Component
@EnableConfigurationProperties(RateLimitProperties.class)
public class RateLimiterRegistry {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterRegistry.class);

    private final RateLimitProperties properties;
    private final ConcurrentHashMap<String, RateLimiter> cache = new ConcurrentHashMap<>();

    public RateLimiterRegistry(RateLimitProperties properties) {
        this.properties = properties;
    }

    /**
     * Returns (creating if needed) the rate limiter registered under {@code name}.
     */
    public RateLimiter get(String name) {
        return cache.computeIfAbsent(name, this::build);
    }

    private RateLimiter build(String name) {
        if (!properties.isEnabled()) {
            log.info("Rate limiting disabled globally; '{}' will not be throttled", name);
            return new NoOpRateLimiter(name);
        }

        RateLimitProperties.Limit limit = properties.getLimits().get(name);
        if (limit == null) {
            log.info("No rate-limit configured for '{}'; defaulting to no-op", name);
            return new NoOpRateLimiter(name);
        }

        log.info("Configured rate limiter '{}' -> {} permit(s) per {} ms",
                name, limit.getPermits(), limit.getPeriodMs());
        return new TokenBucketRateLimiter(name, limit.getPermits(), limit.getPeriodMs());
    }
}
