package com.theggwp.theggwp_orchestrator_service.source.pandascore;

/**
 * Result of parsing the raw Pandascore tournaments payload.
 *
 * <p>Kept deliberately small for now; richer parsing (mapping to domain entities, filtering,
 * enrichment, etc.) is added simply by introducing more workflow steps that operate on this type.</p>
 *
 * @param rawJson   the original JSON payload
 * @param count     number of tournament records detected (-1 if unknown)
 * @param fetchedAt epoch seconds when the data was fetched/parsed
 */
public record ParsedTournaments(String rawJson, int count, long fetchedAt) {
}
