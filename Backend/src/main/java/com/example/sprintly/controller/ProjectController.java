package com.example.sprintly.controller;

import com.example.sprintly.dto.*;
import com.example.sprintly.model.*;
import com.example.sprintly.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    // ── Helper: current authenticated user ──────────────────────────────────

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

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

    private WorkflowStageResponse toStageResponse(WorkflowStage s) {
        List<TaskResponse> tasks = s.getTasks() == null ? List.of() :
                s.getTasks().stream()
                        .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                        .map(this::toTaskResponse)
                        .collect(Collectors.toList());
        return WorkflowStageResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .stageOrder(s.getStageOrder())
                .tasks(tasks)
                .build();
    }

    private ProjectResponse toProjectResponse(Project p) {
        List<WorkflowStageResponse> stages = p.getWorkflowStages() == null ? List.of() :
                p.getWorkflowStages().stream()
                        .sorted((a, b) -> Integer.compare(a.getStageOrder(), b.getStageOrder()))
                        .map(this::toStageResponse)
                        .collect(Collectors.toList());
        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .creatorEmail(p.getCreator().getEmail())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .memberCount(p.getMembers() == null ? 0 : p.getMembers().size())
                .stages(stages)
                .build();
    }

    // ── Project CRUD ─────────────────────────────────────────────────────────

    @GetMapping("/projects")
    public List<ProjectResponse> listProjects() {
        User user = currentUser();
        return projectRepository.findAllByMemberEmail(user.getEmail())
                .stream()
                .map(this::toProjectResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/projects")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest req) {
        User user = currentUser();

        Project project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .creator(user)
                .build();
        project = projectRepository.save(project);

        // Creator automatically becomes OWNER member
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(UserRole.owner)
                .build();
        projectMemberRepository.save(member);

        return ResponseEntity.ok(toProjectResponse(projectRepository.findById(project.getId()).orElseThrow()));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(p -> ResponseEntity.ok(toProjectResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest req) {
        return projectRepository.findById(id).map(p -> {
            p.setName(req.getName());
            p.setDescription(req.getDescription());
            return ResponseEntity.ok(toProjectResponse(projectRepository.save(p)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Workflow Stages ──────────────────────────────────────────────────────

    @GetMapping("/projects/{id}/stages")
    public ResponseEntity<List<WorkflowStageResponse>> listStages(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<WorkflowStageResponse> stages = workflowStageRepository
                .findByProjectIdOrderByStageOrderAsc(id)
                .stream()
                .map(this::toStageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stages);
    }

    @PostMapping("/projects/{id}/stages")
    public ResponseEntity<WorkflowStageResponse> createStage(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowStageRequest req) {
        Project project = projectRepository.findById(id)
                .orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        WorkflowStage stage = WorkflowStage.builder()
                .project(project)
                .name(req.getName())
                .stageOrder(req.getStageOrder())
                .build();
        return ResponseEntity.ok(toStageResponse(workflowStageRepository.save(stage)));
    }

    // ── Tasks under a project ────────────────────────────────────────────────

    @GetMapping("/projects/{id}/tasks")
    public ResponseEntity<List<TaskResponse>> listTasks(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<TaskResponse> tasks = taskRepository.findByProjectId(id)
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest req) {
        User creator = currentUser();

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        WorkflowStage stage = workflowStageRepository.findById(req.getStageId()).orElse(null);
        if (stage == null) return ResponseEntity.badRequest().build();

        User assignee = null;
        if (req.getAssigneeEmail() != null && !req.getAssigneeEmail().isBlank()) {
            assignee = userRepository.findByEmail(req.getAssigneeEmail()).orElse(null);
        }

        int position = taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getStage().getId().equals(req.getStageId()))
                .mapToInt(Task::getPosition)
                .max()
                .orElse(0) + 1;

        Task task = Task.builder()
                .project(project)
                .stage(stage)
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(TaskPriority.valueOf(req.getPriority()))
                .dueDate(req.getDueDate())
                .assignee(assignee)
                .creator(creator)
                .position(position)
                .build();

        return ResponseEntity.ok(toTaskResponse(taskRepository.save(task)));
    }

    // ── Dashboard stats ──────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats() {
        User user = currentUser();

        List<Long> projectIds = projectMemberRepository.findProjectIdsByUserEmail(user.getEmail());

        if (projectIds.isEmpty()) {
            return DashboardStatsResponse.builder()
                    .totalProjects(0)
                    .activeTasks(0)
                    .completedTasks(0)
                    .overdueTasks(0)
                    .completionPercent(0)
                    .build();
        }

        List<Task> allTasks = projectIds.stream()
                .flatMap(pid -> taskRepository.findByProjectId(pid).stream())
                .collect(Collectors.toList());

        // Determine "done" stages: highest stageOrder per project
        List<WorkflowStage> lastStages = projectIds.stream()
                .flatMap(pid -> workflowStageRepository.findByProjectIdOrderByStageOrderAsc(pid).stream())
                .collect(Collectors.groupingBy(s -> s.getProject().getId()))
                .values().stream()
                .map(stages -> stages.get(stages.size() - 1))
                .collect(Collectors.toList());

        List<Long> doneStageIds = lastStages.stream().map(WorkflowStage::getId).collect(Collectors.toList());

        int total = allTasks.size();
        int completed = (int) allTasks.stream().filter(t -> doneStageIds.contains(t.getStage().getId())).count();
        int active = total - completed;
        int overdue = (int) allTasks.stream()
                .filter(t -> !doneStageIds.contains(t.getStage().getId())
                        && t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        double completionPercent = total == 0 ? 0 : Math.round((completed * 100.0 / total) * 10.0) / 10.0;

        return DashboardStatsResponse.builder()
                .totalProjects(projectIds.size())
                .activeTasks(active)
                .completedTasks(completed)
                .overdueTasks(overdue)
                .completionPercent(completionPercent)
                .build();
    }
}
