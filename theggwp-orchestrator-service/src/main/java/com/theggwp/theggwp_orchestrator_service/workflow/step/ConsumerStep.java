package com.theggwp.theggwp_orchestrator_service.workflow.step;

import java.util.function.Consumer;

import com.theggwp.theggwp_orchestrator_service.workflow.Step;
import com.theggwp.theggwp_orchestrator_service.workflow.WorkflowContext;

/**
 * Generic terminal/side-effect step (e.g. persistence, publishing) backed by a {@link Consumer}.
 *
 * <p>Consumes a value of type {@code I}, performs a side effect, and returns {@code Void} so it
 * can sit at the end of a workflow.</p>
 *
 * @param <I> input type consumed by the side effect
 */
public class ConsumerStep<I> implements Step<I, Void> {

    private final String name;
    private final Consumer<I> consumer;

    public ConsumerStep(String name, Consumer<I> consumer) {
        this.name = name;
        this.consumer = consumer;
    }

    @Override
    public Void execute(I input, WorkflowContext context) {
        consumer.accept(input);
        return null;
    }

    @Override
    public String name() {
        return name;
    }
}
