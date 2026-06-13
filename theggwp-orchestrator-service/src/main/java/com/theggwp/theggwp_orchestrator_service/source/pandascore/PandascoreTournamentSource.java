package com.theggwp.theggwp_orchestrator_service.source.pandascore;

import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.theggwp.theggwp_orchestrator_service.source.DataSource;

/**
 * {@link DataSource} that pulls Valorant tournament data from the Pandascore API.
 *
 * <p>All endpoint, token and timeout values come from {@link PandascoreProperties}
 * (i.e. {@code application.properties}). To add another Pandascore endpoint (or an entirely new
 * provider) simply create another {@code DataSource} implementation - nothing else changes.</p>
 */
@Component
@EnableConfigurationProperties(PandascoreProperties.class)
public class PandascoreTournamentSource implements DataSource<String> {

    public static final String SOURCE_NAME = "pandascore-tournaments";

    private final WebClient webClient;
    private final PandascoreProperties properties;

    public PandascoreTournamentSource(WebClient webClient, PandascoreProperties properties) {
        this.webClient = webClient;
        this.properties = properties;
    }

    @Override
    public String name() {
        return SOURCE_NAME;
    }

    @Override
    public String fetch() {
        String url = properties.getBaseUrl() + properties.getTournamentsPath()
                + "?token=" + properties.getToken();

        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofMillis(properties.getRequestTimeoutMs()));
    }
}
