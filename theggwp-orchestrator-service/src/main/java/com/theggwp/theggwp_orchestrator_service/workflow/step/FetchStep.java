package com.theggwp.theggwp_orchestrator_service.workflow.step;

import com.theggwp.theggwp_orchestrator_service.source.DataSource;
import com.theggwp.theggwp_orchestrator_service.workflow.Step;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowContext;

/**
 * Generic first step of a pull workflow: fetches raw data from a {@link DataSource}.
 *
 * <p>Takes no meaningful input ({@code Void}) and emits the raw payload of type {@code R}.
 * Reusable across every source - swapping the source is the only change required.</p>
 *
 * @param <R> raw payload type returned by the source
 */
public class FetchStep<R> implements Step<Void, R> {

    private final DataSource<R> source;

    public FetchStep(DataSource<R> source) {
        this.source = source;
    }

    @Override
    public R execute(Void input, WorkflowContext context) throws Exception {
        R data = source.fetch();
        context.putAttribute("source", source.name());
        return data;
    }

    @Override
    public String name() {
        return "fetch[" + source.name() + "]";
    }
}
