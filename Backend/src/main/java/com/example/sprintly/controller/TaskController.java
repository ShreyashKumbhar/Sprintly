package com.example.sprintly.controller;

import com.example.sprintly.dto.TaskMoveRequest;
import com.example.sprintly.dto.TaskRequest;
import com.example.sprintly.dto.TaskResponse;
import com.example.sprintly.model.*;
import com.example.sprintly.repository.TaskRepository;
import com.example.sprintly.repository.TaskStatusHistoryRepository;
import com.example.sprintly.repository.UserRepository;
import com.example.sprintly.repository.WorkflowStageRepository;
import com.example.sprintly.security.RbacService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskRepository taskRepository;
    @Autowired private TaskStatusHistoryRepository taskStatusHistoryRepository;
    @Autowired private WorkflowStageRepository workflowStageRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RbacService rbacService;

    private TaskResponse toTaskResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority().name())
                .dueDate(t.getDueDate())
                .assigneeEmail(t.getAssignee() != null ? t.getAssignee().getEmail() : null)
                .stageId(t.getStage().getId())
                .position(t.getPosition())
                .createdAt(t.getCreatedAt())
                .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        rbacService.requireRole(task.getProject().getId(),
                UserRole.owner, UserRole.participant, UserRole.viewer);
        return ResponseEntity.ok(toTaskResponse(task));
    }

    /** Owner and participant can update any task in the project. */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,
                                                    @Valid @RequestBody TaskRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Long projectId = task.getProject().getId();
        rbacService.requireRole(projectId, UserRole.owner, UserRole.participant);

        WorkflowStage stage = workflowStageRepository.findById(req.getStageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage not found"));

        User assignee = null;
        if (req.getAssigneeEmail() != null && !req.getAssigneeEmail().isBlank()) {
            assignee = userRepository.findByEmail(req.getAssigneeEmail()).orElse(null);
        }

        boolean stageChanged = !task.getStage().getId().equals(stage.getId());

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setPriority(TaskPriority.valueOf(req.getPriority()));
        task.setDueDate(req.getDueDate());
        task.setAssignee(assignee);
        task.setStage(stage);

        Task saved = taskRepository.save(task);

        if (stageChanged) {
            taskStatusHistoryRepository.save(TaskStatusHistory.builder()
                    .task(saved).stage(stage).stageName(stage.getName())
                    .enteredAt(OffsetDateTime.now()).build());
        }

        return ResponseEntity.ok(toTaskResponse(saved));
    }

    /**
     * Move a task to a different stage (or reorder within stage).
     * Owner and participant can move any task in the project.
     */
    @PatchMapping("/{id}/move")
    public ResponseEntity<TaskResponse> moveTask(@PathVariable Long id,
                                                  @Valid @RequestBody TaskMoveRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Long projectId = task.getProject().getId();
        rbacService.requireRole(projectId, UserRole.owner, UserRole.participant);

        WorkflowStage targetStage = workflowStageRepository.findById(req.getStageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target stage not found"));

        if (!targetStage.getProject().getId().equals(projectId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage does not belong to this project");
        }

        // Append to end of target stage
        int newPosition = taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getStage().getId().equals(req.getStageId()) && !t.getId().equals(id))
                .mapToInt(Task::getPosition).max().orElse(0) + 1;

        task.setStage(targetStage);
        task.setPosition(newPosition);

        Task saved = taskRepository.save(task);

        // Record status transition
        taskStatusHistoryRepository.save(TaskStatusHistory.builder()
                .task(saved).stage(targetStage).stageName(targetStage.getName())
                .enteredAt(OffsetDateTime.now()).build());

        return ResponseEntity.ok(toTaskResponse(saved));
    }

    /** Owner only. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        rbacService.requireRole(task.getProject().getId(), UserRole.owner);
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** All tasks assigned to the current user across all projects. (FR-22) */
    @GetMapping("/mine")
    public List<TaskResponse> myTasks() {
        User user = userRepository.findByEmail(rbacService.currentEmail()).orElseThrow();
        return taskRepository.findByAssigneeId(user.getId())
                .stream().map(this::toTaskResponse).collect(Collectors.toList());
    }
}
