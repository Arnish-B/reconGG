package com.theggwp.theggwp_orchestrator_service.workflow;

import java.util.ArrayList;
import java.util.List;

/**
 * Fluent, type-safe builder for {@link Workflow} instances.
 *
 * <p>The generic parameters track the input type and the <em>current</em> output type so that
 * {@link #then(Step)} can only accept a step whose input matches the previous step's output.
 * This gives compile-time safety while keeping the pipeline fully generic and extensible.</p>
 *
 * <pre>{@code
 * Workflow<Void, Void> wf = WorkflowBuilder.named("my-job")
 *         .start(new FetchStep<>(source))     // Void  -> String
 *         .then(new TransformStep<>("parse", parser)) // String -> Parsed
 *         .then(new ConsumerStep<>("persist", repo::save)) // Parsed -> Void
 *         .build();
 * }</pre>
 *
 * @param <I> the workflow input type (fixed once {@link #start(Step)} is called)
 * @param <C> the current (most recent) output type in the chain
 */
public final class WorkflowBuilder<I, C> {

    private final String name;
    private final List<Step<?, ?>> steps;

    private WorkflowBuilder(String name, List<Step<?, ?>> steps) {
        this.name = name;
        this.steps = steps;
    }

    /**
     * Entry point: start defining a workflow with the given name.
     */
    public static Named named(String name) {
        return new Named(name);
    }

    /**
     * Intermediate holder so the first {@link #start(Step)} call can infer the input type.
     */
    public static final class Named {
        private final String name;

        private Named(String name) {
            this.name = name;
        }

        public <I, O> WorkflowBuilder<I, O> start(Step<I, O> first) {
            List<Step<?, ?>> steps = new ArrayList<>();
            steps.add(first);
            return new WorkflowBuilder<>(name, steps);
        }
    }

    /**
     * Append a step whose input type matches the current output type {@code C}.
     *
     * @param next the next step, producing a new output type {@code O}
     * @param <O>  the new current output type
     */
    public <O> WorkflowBuilder<I, O> then(Step<C, O> next) {
        steps.add(next);
        return new WorkflowBuilder<>(name, steps);
    }

    public Workflow<I, C> build() {
        return new Workflow<>(name, steps);
    }
}
