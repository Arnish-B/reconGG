package com.theggwp.theggwp_orchestrator_service.workflow;

/**
 * A single unit of work in a {@link Workflow}.
 *
 * <p>A step transforms an input of type {@code I} into an output of type {@code O}.
 * Steps are composed together (the output of one becomes the input of the next) to
 * form a complete data-processing pipeline for a scheduled job.</p>
 *
 * <p>To add new behaviour to a job (for example, a new parsing/enrichment stage) you
 * simply implement another {@code Step} and insert it into the workflow - no existing
 * step needs to change. This is the primary extensibility point of the framework.</p>
 *
 * @param <I> input type consumed by this step
 * @param <O> output type produced by this step
 */
@FunctionalInterface
public interface Step<I, O> {

    /**
     * Executes the step.
     *
     * @param input   the output of the previous step (or the workflow input for the first step)
     * @param context shared mutable context for the running workflow
     * @return the value passed to the next step
     * @throws Exception if the step fails; the workflow is aborted and the error recorded
     */
    O execute(I input, WorkflowContext context) throws Exception;

    /**
     * Human-readable name used for logging and metrics. Defaults to the class simple name.
     */
    default String name() {
        return getClass().getSimpleName();
    }
}
