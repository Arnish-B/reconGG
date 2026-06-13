package com.theggwp.theggwp_orchestrator_service.source.pandascore;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalised configuration for the Pandascore data source. All values live in
 * {@code application.properties} under the {@code pandascore.*} prefix so URLs, tokens and
 * timeouts can be changed without recompiling.
 */
@ConfigurationProperties(prefix = "pandascore")
public class PandascoreProperties {

    /** Base URL of the Pandascore API. */
    private String baseUrl = "https://api.pandascore.co";

    /** Path of the tournaments endpoint, appended to {@link #baseUrl}. */
    private String tournamentsPath = "/valorant/tournaments";

    /** API token. */
    private String token;

    /** Per-request timeout in milliseconds (token timeout). */
    private long requestTimeoutMs = 10000;

    /** Scheduler poll interval in milliseconds. */
    private long pollIntervalMs = 60000;

    /** Scheduler thread-pool size. */
    private int threadPoolSize = 4;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getTournamentsPath() {
        return tournamentsPath;
    }

    public void setTournamentsPath(String tournamentsPath) {
        this.tournamentsPath = tournamentsPath;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getRequestTimeoutMs() {
        return requestTimeoutMs;
    }

    public void setRequestTimeoutMs(long requestTimeoutMs) {
        this.requestTimeoutMs = requestTimeoutMs;
    }

    public long getPollIntervalMs() {
        return pollIntervalMs;
    }

    public void setPollIntervalMs(long pollIntervalMs) {
        this.pollIntervalMs = pollIntervalMs;
    }

    public int getThreadPoolSize() {
        return threadPoolSize;
    }

    public void setThreadPoolSize(int threadPoolSize) {
        this.threadPoolSize = threadPoolSize;
    }
}
