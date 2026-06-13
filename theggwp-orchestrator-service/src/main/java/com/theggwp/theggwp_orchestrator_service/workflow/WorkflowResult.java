package com.theggwp.theggwp_orchestrator_service.workflow;

/**
 * Outcome of a {@link Workflow} run.
 *
 * @param <O> type of the final workflow output
 */
public final class WorkflowResult<O> {

    private final boolean success;
    private final O output;
    private final Throwable error;
    private final WorkflowContext context;

    private WorkflowResult(boolean success, O output, Throwable error, WorkflowContext context) {
        this.success = success;
        this.output = output;
        this.error = error;
        this.context = context;
    }

    public static <O> WorkflowResult<O> success(O output, WorkflowContext context) {
        return new WorkflowResult<>(true, output, null, context);
    }

    public static <O> WorkflowResult<O> failure(Throwable error, WorkflowContext context) {
        return new WorkflowResult<>(false, null, error, context);
    }

    public boolean isSuccess() {
        return success;
    }

    public O getOutput() {
        return output;
    }

    public Throwable getError() {
        return error;
    }

    public WorkflowContext getContext() {
        return context;
    }
}
