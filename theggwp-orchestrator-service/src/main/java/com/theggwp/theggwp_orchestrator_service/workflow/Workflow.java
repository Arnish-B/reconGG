package com.theggwp.theggwp_orchestrator_service.workflow;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An ordered, type-safe pipeline of {@link Step}s.
 *
 * <p>A workflow consumes a single input of type {@code I}, threads it through every step
 * (output of step N becomes input of step N+1) and produces a final output of type {@code O}.
 * Per-step timing and success/failure are recorded on the {@link WorkflowContext}.</p>
 *
 * <p>Build instances with {@link WorkflowBuilder}.</p>
 *
 * @param <I> workflow input type
 * @param <O> workflow output type
 */
public final class Workflow<I, O> {

    private static final Logger log = LoggerFactory.getLogger(Workflow.class);

    private final String name;
    private final List<Step<?, ?>> steps;

    Workflow(String name, List<Step<?, ?>> steps) {
        this.name = name;
        this.steps = List.copyOf(steps);
    }

    public String getName() {
        return name;
    }

    /**
     * Runs the workflow. Execution stops at the first failing step.
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    public WorkflowResult<O> run(I input) {
        WorkflowContext context = new WorkflowContext(name);
        log.info("[workflow:{}] started with {} step(s)", name, steps.size());

        Object current = input;
        for (Step step : steps) {
            long startNanos = System.nanoTime();
            try {
                current = step.execute(current, context);
                Duration took = Duration.ofNanos(System.nanoTime() - startNanos);
                context.recordExecution(new WorkflowContext.StepExecution(step.name(), true, took, null));
                log.debug("[workflow:{}] step '{}' ok in {} ms", name, step.name(), took.toMillis());
            } catch (Exception ex) {
                Duration took = Duration.ofNanos(System.nanoTime() - startNanos);
                context.recordExecution(
                        new WorkflowContext.StepExecution(step.name(), false, took, ex.getMessage()));
                log.error("[workflow:{}] step '{}' failed: {}", name, step.name(), ex.getMessage(), ex);
                return WorkflowResult.failure(ex, context);
            }
        }

        log.info("[workflow:{}] completed successfully", name);
        return WorkflowResult.success((O) current, context);
    }
}
