package com.theggwp.theggwp_orchestrator_service.source.henrik;

import com.theggwp.theggwp_orchestrator_service.source.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Data source for fetching detailed match information including games and rounds from Henrik API.
 * Uses the /valorant/v2/match/{matchid} endpoint which provides:
 * - Match metadata (map, game length, rounds played)
 * - All players with detailed stats
 * - Round-by-round details (winning team, bomb plants, player locations)
 * - Team information
 * 
 * This is a stateful source that needs a match ID set before fetching.
 */
@Component
public class HenrikMatchDetailSource implements DataSource<String> {

    private static final Logger log = LoggerFactory.getLogger(HenrikMatchDetailSource.class);

    private final WebClient webClient;
    private final HenrikProperties properties;
    private String matchId;

    public HenrikMatchDetailSource(WebClient webClient, HenrikProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    public void setMatchId(String matchId) {
        this.matchId = matchId;
    }

    @Override
    public String name() {
        return "henrik-match-detail-source";
    }

    @Override
    public String fetch() throws Exception {
        if (matchId == null) {
            throw new IllegalArgumentException("match_id must be set before fetch");
        }

        String url = properties.getBaseUrl() + 
                     properties.getMatchDetailPath().replace("{matchid}", matchId);
        log.info("Fetching match details for match {} from Henrik API: {}", matchId, url);

        try {
            return webClient.get()
                    .uri(url)
                    .header("Authorization", properties.getToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(properties.getRequestTimeoutMs()))
                    .doOnSuccess(json -> log.info("Successfully fetched match details for match {}", matchId))
                    .doOnError(e -> log.error("Failed to fetch match details for match {}", matchId, e))
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch match details for match {}", matchId, e);
            throw e;
        }
    }
}
