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
    private String schedulePath;
    private String matchDetailPath;
    private String playerMatchesPath;
    private int requestTimeoutMs;
    private int pollIntervalMs;

    /** CSV roster of tracked players to ingest, each entry formatted {@code region:name:tag}. */
    private String roster;
    /** Mode filter for player match history (e.g. {@code competitive}); empty = no filter. */
    private String playerMatchesMode;
    /** How many recent games to request per player (Henrik allows 1..10). */
    private int playerMatchesSize = 5;
    /** CSV of explicit Valorant match UUIDs to drill into via v2/match; empty = none. */
    private String matchUuids;

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

    public String getSchedulePath() {
        return schedulePath;
    }

    public void setSchedulePath(String schedulePath) {
        this.schedulePath = schedulePath;
    }

    public String getMatchDetailPath() {
        return matchDetailPath;
    }

    public void setMatchDetailPath(String matchDetailPath) {
        this.matchDetailPath = matchDetailPath;
    }

    public String getPlayerMatchesPath() {
        return playerMatchesPath;
    }

    public void setPlayerMatchesPath(String playerMatchesPath) {
        this.playerMatchesPath = playerMatchesPath;
    }

    public String getRoster() {
        return roster;
    }

    public void setRoster(String roster) {
        this.roster = roster;
    }

    public String getPlayerMatchesMode() {
        return playerMatchesMode;
    }

    public void setPlayerMatchesMode(String playerMatchesMode) {
        this.playerMatchesMode = playerMatchesMode;
    }

    public int getPlayerMatchesSize() {
        return playerMatchesSize;
    }

    public void setPlayerMatchesSize(int playerMatchesSize) {
        this.playerMatchesSize = playerMatchesSize;
    }

    public String getMatchUuids() {
        return matchUuids;
    }

    public void setMatchUuids(String matchUuids) {
        this.matchUuids = matchUuids;
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
