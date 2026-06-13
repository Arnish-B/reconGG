package com.theggwp.theggwp_orchestrator_service.workflow.step;

import java.util.function.Function;

import com.theggwp.theggwp_orchestrator_service.workflow.Step;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowContext;

/**
 * Generic transformation/parsing step backed by a {@link Function}.
 *
 * <p>This is the building block for the "parsing of the data ... should simply mean adding a
 * new step" requirement: to add a parse/enrich/validate stage, construct a {@code TransformStep}
 * with the appropriate function and insert it into the workflow.</p>
 *
 * @param <I> input type
 * @param <O> output type
 */
public class TransformStep<I, O> implements Step<I, O> {

    private final String name;
    private final Function<I, O> transformer;

    public TransformStep(String name, Function<I, O> transformer) {
        this.name = name;
        this.transformer = transformer;
    }

    @Override
    public O execute(I input, WorkflowContext context) {
        return transformer.apply(input);
    }

    @Override
    public String name() {
        return name;
    }
}
