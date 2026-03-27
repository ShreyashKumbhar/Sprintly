package com.example.sprintly.controller;

import com.example.sprintly.dto.TaskRequest;
import com.example.sprintly.dto.TaskResponse;
import com.example.sprintly.model.Task;
import com.example.sprintly.model.TaskPriority;
import com.example.sprintly.model.User;
import com.example.sprintly.model.WorkflowStage;
import com.example.sprintly.repository.TaskRepository;
import com.example.sprintly.repository.UserRepository;
import com.example.sprintly.repository.WorkflowStageRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private UserRepository userRepository;

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
        return taskRepository.findById(id)
                .map(t -> ResponseEntity.ok(toTaskResponse(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest req) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();

        WorkflowStage stage = workflowStageRepository.findById(req.getStageId()).orElse(null);
        if (stage == null) return ResponseEntity.badRequest().build();

        User assignee = null;
        if (req.getAssigneeEmail() != null && !req.getAssigneeEmail().isBlank()) {
            assignee = userRepository.findByEmail(req.getAssigneeEmail()).orElse(null);
        }

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setPriority(TaskPriority.valueOf(req.getPriority()));
        task.setDueDate(req.getDueDate());
        task.setAssignee(assignee);
        task.setStage(stage);

        return ResponseEntity.ok(toTaskResponse(taskRepository.save(task)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
