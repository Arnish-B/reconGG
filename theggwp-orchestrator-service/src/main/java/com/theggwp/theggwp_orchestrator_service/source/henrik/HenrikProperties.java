package com.theggwp.theggwp_orchestrator_service.source.henrik;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Henrik API.
 * Maps to henrik.* properties in application.properties.
 */
@Component
@ConfigurationProperties(prefix = "henrik")
public class HenrikProperties {

    private String baseUrl;
    private String token;
    private String eventsPath;
    private String eventMatchesPath;
    private String matchDetailsPath;
    private int requestTimeoutMs;
    private int pollIntervalMs;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEventsPath() {
        return eventsPath;
    }

    public void setEventsPath(String eventsPath) {
        this.eventsPath = eventsPath;
    }

    public String getEventMatchesPath() {
        return eventMatchesPath;
    }

    public void setEventMatchesPath(String eventMatchesPath) {
        this.eventMatchesPath = eventMatchesPath;
    }

    public String getMatchDetailsPath() {
        return matchDetailsPath;
    }

    public void setMatchDetailsPath(String matchDetailsPath) {
        this.matchDetailsPath = matchDetailsPath;
    }

    public int getRequestTimeoutMs() {
        return requestTimeoutMs;
    }

    public void setRequestTimeoutMs(int requestTimeoutMs) {
        this.requestTimeoutMs = requestTimeoutMs;
    }

    public int getPollIntervalMs() {
        return pollIntervalMs;
    }

    public void setPollIntervalMs(int pollIntervalMs) {
        this.pollIntervalMs = pollIntervalMs;
    }
}
