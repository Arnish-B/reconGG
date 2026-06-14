package com.theggwp.theggwp_orchestrator_service.workflow;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Shared, mutable state carried through the execution of a single {@link Workflow} run.
 *
 * <p>Steps can stash arbitrary attributes here (for cross-step communication) and the
 * framework records per-step execution metrics that can be used for logging,
 * observability, or smoke tests.</p>
 */
public class WorkflowContext {

    private final String workflowName;
    private final Instant startedAt = Instant.now();
    private final Map<String, Object> attributes = new HashMap<>();
    private final List<StepExecution> executions = new ArrayList<>();

    public WorkflowContext(String workflowName) {
        this.workflowName = workflowName;
    }

    public String getWorkflowName() {
        return workflowName;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void putAttribute(String key, Object value) {
        attributes.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> Optional<T> getAttribute(String key) {
        return Optional.ofNullable((T) attributes.get(key));
    }

    void recordExecution(StepExecution execution) {
        executions.add(execution);
    }

    public List<StepExecution> getExecutions() {
        return Collections.unmodifiableList(executions);
    }

    /**
     * Immutable record describing the outcome of a single step.
     */
    public record StepExecution(String stepName, boolean success, Duration duration, String error) {
    }
}
