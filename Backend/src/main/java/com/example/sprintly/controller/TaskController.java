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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
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

    /** Owner only (task field edits, assignment, stage via update). */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,
                                                    @Valid @RequestBody TaskRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Long projectId = task.getProject().getId();
        rbacService.requireRole(projectId, UserRole.owner);

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
     * Move a task to a stage and/or reorder within a stage.
     * Owner: any task. Participant: only tasks assigned to them. Viewer: not allowed.
     * {@code position} is 0-based in the target stage after logically removing this task from its current stage.
     * If {@code position} is null, the task is appended to the end of the target stage.
     */
    @PatchMapping("/{id}/move")
    @Transactional
    public ResponseEntity<TaskResponse> moveTask(@PathVariable Long id,
                                                  @Valid @RequestBody TaskMoveRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Long projectId = task.getProject().getId();
        UserRole memberRole = rbacService.requireRole(projectId, UserRole.owner, UserRole.participant);
        if (memberRole == UserRole.participant) {
            User assignee = task.getAssignee();
            String me = rbacService.currentEmail();
            if (assignee == null || !me.equalsIgnoreCase(assignee.getEmail())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Only the assignee can move this task");
            }
        }

        WorkflowStage targetStage = workflowStageRepository.findById(req.getStageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target stage not found"));

        if (!targetStage.getProject().getId().equals(projectId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage does not belong to this project");
        }

        Long sourceStageId = task.getStage().getId();
        Long targetStageId = targetStage.getId();
        boolean stageChanged = !sourceStageId.equals(targetStageId);

        List<Task> sourceList = new ArrayList<>(taskRepository.findByStage_IdOrderByPositionAsc(sourceStageId));
        Task moving = sourceList.stream().filter(t -> t.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        sourceList.removeIf(t -> t.getId().equals(id));

        Integer insertAt = req.getPosition();
        if (insertAt == null) {
            insertAt = sourceStageId.equals(targetStageId) ? sourceList.size()
                    : taskRepository.findByStage_IdOrderByPositionAsc(targetStageId).size();
        }
        insertAt = Math.max(0, insertAt);

        if (sourceStageId.equals(targetStageId)) {
            List<Task> ordered = new ArrayList<>(sourceList);
            insertAt = Math.min(insertAt, ordered.size());
            ordered.add(insertAt, moving);
            moving.setStage(targetStage);
            renumberTaskPositions(ordered);
            taskRepository.saveAll(ordered);
        } else {
            renumberTaskPositions(sourceList);
            taskRepository.saveAll(sourceList);

            List<Task> targetList = new ArrayList<>(taskRepository.findByStage_IdOrderByPositionAsc(targetStageId));
            insertAt = Math.min(insertAt, targetList.size());
            moving.setStage(targetStage);
            targetList.add(insertAt, moving);
            renumberTaskPositions(targetList);
            taskRepository.saveAll(targetList);
        }

        Task saved = taskRepository.findById(id).orElseThrow();

        if (stageChanged) {
            taskStatusHistoryRepository.save(TaskStatusHistory.builder()
                    .task(saved).stage(targetStage).stageName(targetStage.getName())
                    .enteredAt(OffsetDateTime.now()).build());
        }

        return ResponseEntity.ok(toTaskResponse(saved));
    }

    private void renumberTaskPositions(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setPosition(i + 1);
        }
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
