package com.theggwp.theggwp_orchestrator_service.service;

import org.springframework.stereotype.Service;

import com.theggwp.theggwp_orchestrator_service.repository.TournamentRepository;

/**
 * Read-side service for stored Pandascore data.
 *
 * <p>The fetch/parse/store flow now lives in
 * {@link com.theggwp.theggwp_orchestrator_service.job.PandascoreTournamentJob} on top of the
 * generic workflow framework. This service only exposes the latest persisted payload.</p>
 */
@Service
public class PandascoreService {

    private final TournamentRepository tournamentRepository;

    public PandascoreService(TournamentRepository tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
    }

    public String getLatest() {
        return tournamentRepository.findLatest().orElse("[]");
    }
}
