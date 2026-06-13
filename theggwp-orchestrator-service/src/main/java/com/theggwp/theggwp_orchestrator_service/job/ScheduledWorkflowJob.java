package com.theggwp.theggwp_orchestrator_service.job;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiter;
import com.theggwp.theggwp_orchestrator_service.ratelimit.RateLimiterRegistry;
import com.theggwp.theggwp_orchestrator_service.workflow.Workflow;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowResult;

/**
 * Generic base class for every scheduled ("cron") job in the service.
 *
 * <p>It standardises the lifecycle of a scheduled run:
 * <ol>
 *   <li>consult the configured {@link RateLimiter} (skip the run if throttled),</li>
 *   <li>execute the job's {@link Workflow},</li>
 *   <li>record the outcome for health/smoke reporting.</li>
 * </ol>
 *
 * <p>Adding a new cron job later means: extend this class, define the job name, input and
 * {@link Workflow}, and annotate a method with {@code @Scheduled} that calls {@link #trigger()}.
 * No other framework code needs to change.</p>
 *
 * @param <I> workflow input type
 * @param <O> workflow output type
 */
public abstract class ScheduledWorkflowJob<I, O> {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    private final RateLimiterRegistry rateLimiterRegistry;

    private volatile Instant lastRunAt;
    private volatile boolean lastRunSuccessful;
    private volatile String lastError;
    private volatile boolean everRan;

    protected ScheduledWorkflowJob(RateLimiterRegistry rateLimiterRegistry) {
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    /** Unique name of this job; also used to look up its rate-limit config. */
    protected abstract String jobName();

    /** The workflow this job runs on each trigger. */
    protected abstract Workflow<I, O> workflow();

    /** Input supplied to the workflow on each run (often {@code null}/{@code Void}). */
    protected abstract I workflowInput();

    /**
     * Entry point invoked by the {@code @Scheduled} method of the concrete subclass.
     * Applies rate limiting and runs the workflow.
     */
    public final WorkflowResult<O> trigger() {
        RateLimiter limiter = rateLimiterRegistry.get(jobName());
        if (!limiter.tryAcquire()) {
            log.warn("[job:{}] skipped - rate limit exceeded", jobName());
            return null;
        }

        log.info("[job:{}] triggered", jobName());
        WorkflowResult<O> result = workflow().run(workflowInput());

        this.lastRunAt = Instant.now();
        this.everRan = true;
        this.lastRunSuccessful = result.isSuccess();
        this.lastError = result.isSuccess() || result.getError() == null
                ? null
                : result.getError().getMessage();
        return result;
    }

    // --- status accessors used by health / smoke endpoints -------------------------------

    public Instant getLastRunAt() {
        return lastRunAt;
    }

    public boolean isLastRunSuccessful() {
        return lastRunSuccessful;
    }

    public String getLastError() {
        return lastError;
    }

    public boolean hasEverRun() {
        return everRan;
    }

    public String name() {
        return jobName();
    }
}
