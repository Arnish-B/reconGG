package com.theggwp.theggwp_orchestrator_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Shared scheduler used to execute the {@code @Scheduled} cron jobs.
 * Pool size is configurable via {@code pandascore.thread-pool-size}.
 */
@Configuration
public class SchedulerConfig {

    @Value("${pandascore.thread-pool-size:4}")
    private int poolSize;

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(poolSize);
        scheduler.setThreadNamePrefix("orchestrator-sched-");
        scheduler.initialize();
        return scheduler;
    }
}
