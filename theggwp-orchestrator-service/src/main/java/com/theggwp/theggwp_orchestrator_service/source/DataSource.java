package com.theggwp.theggwp_orchestrator_service.source;

/**
 * Abstraction over an external system data is pulled from.
 *
 * <p>Adding a new source of data (a new API, file feed, database, etc.) is as simple as
 * implementing this interface and registering it as a Spring bean. The workflow framework
 * consumes any {@code DataSource} through {@link com.theggwp.theggwp_orchestrator_service.workflow.step.FetchStep}
 * without needing source-specific logic.</p>
 *
 * @param <R> the raw payload type produced by this source (e.g. {@code String} JSON,
 *            a DTO, a byte array, etc.)
 */
public interface DataSource<R> {

    /**
     * Stable, unique identifier for this source. Used for logging, metrics and to look up
     * the matching rate-limit configuration.
     */
    String name();

    /**
     * Pulls the latest raw payload from the source.
     *
     * @return the raw data
     * @throws Exception if the pull fails (network error, timeout, non-2xx response, ...)
     */
    R fetch() throws Exception;
}
