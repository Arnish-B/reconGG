package com.theggwp.theggwp_orchestrator_service.source.henrik;

import com.theggwp.theggwp_orchestrator_service.source.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Data source for fetching tournaments/events from Henrik API.
 * Implements the DataSource interface to integrate with the workflow framework.
 */
@Component
public class HenrikTournamentSource implements DataSource<String> {

    private static final Logger log = LoggerFactory.getLogger(HenrikTournamentSource.class);

    private final WebClient webClient;
    private final HenrikProperties properties;

    public HenrikTournamentSource(WebClient webClient, HenrikProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    @Override
    public String name() {
        return "henrik-tournament-source";
    }

    @Override
    public String fetch() throws Exception {
        String url = properties.getBaseUrl() + properties.getSchedulePath();
        log.info("Fetching esports schedule from Henrik API: {}", url);

        try {
            return webClient.get()
                    .uri(url)
                    .header("Authorization", properties.getToken())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(properties.getRequestTimeoutMs()))
                    .doOnSuccess(json -> log.info("Successfully fetched esports schedule from Henrik API"))
                    .doOnError(e -> log.error("Failed to fetch esports schedule from Henrik API", e))
                    .block();
        } catch (Exception e) {
            log.error("Failed to fetch esports schedule from Henrik API", e);
            throw e;
        }
    }
}
