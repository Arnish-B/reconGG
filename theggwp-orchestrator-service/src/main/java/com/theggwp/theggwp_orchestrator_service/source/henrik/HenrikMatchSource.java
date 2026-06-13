package com.theggwp.theggwp_orchestrator_service.source.henrik;

import com.theggwp.theggwp_orchestrator_service.source.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * DISABLED: Henrik API does not have a separate endpoint for fetching matches by tournament.
 * Match data is included in the /valorant/v1/esports/schedule endpoint.
 * 
 * Data source for fetching matches for a specific tournament from Henrik API.
 * This is a generic source that can be configured with a tournament ID.
 */
// @Component - DISABLED: No separate endpoint for tournament matches
public class HenrikMatchSource implements DataSource<String> {

    private static final Logger log = LoggerFactory.getLogger(HenrikMatchSource.class);

    private final WebClient webClient;
    private final HenrikProperties properties;
    private String tournamentId;

    public HenrikMatchSource(WebClient webClient, HenrikProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    public void setTournamentId(String tournamentId) {
        this.tournamentId = tournamentId;
    }

    @Override
    public String name() {
        return "henrik-match-source";
    }

    @Override
    public String fetch() throws Exception {
        if (tournamentId == null) {
            throw new IllegalArgumentException("tournament_id must be set before fetch");
        }

        // No endpoint available - Henrik only has /valorant/v1/esports/schedule
        String url = properties.getBaseUrl() + "/valorant/v1/esports/schedule";
        log.info("Fetching matches for tournament {} from Henrik API: {}", tournamentId, url);

        try {
            return webClient.get()
                    .uri(url)
                    .header("Authorization", properties.getToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(properties.getRequestTimeoutMs()))
                    .doOnSuccess(json -> log.info("Successfully fetched matches for tournament {}", tournamentId))
                    .doOnError(e -> log.error("Failed to fetch matches for tournament {}", tournamentId, e))
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch matches for tournament {}", tournamentId, e);
            throw e;
        }
    }
}
