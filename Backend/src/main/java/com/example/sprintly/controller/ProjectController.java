package com.example.sprintly.controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.sprintly.dto.DashboardStatsResponse;
import com.example.sprintly.dto.GanttTaskResponse;
import com.example.sprintly.dto.MemberResponse;
import com.example.sprintly.dto.ProjectRequest;
import com.example.sprintly.dto.ProjectResponse;
import com.example.sprintly.dto.TaskRequest;
import com.example.sprintly.dto.TaskResponse;
import com.example.sprintly.dto.TaskStatusHistoryResponse;
import com.example.sprintly.dto.WorkflowStageRequest;
import com.example.sprintly.dto.WorkflowStageResponse;
import com.example.sprintly.model.Project;
import com.example.sprintly.model.ProjectMember;
import com.example.sprintly.model.Task;
import com.example.sprintly.model.TaskPriority;
import com.example.sprintly.model.TaskStatusHistory;
import com.example.sprintly.model.User;
import com.example.sprintly.model.UserRole;
import com.example.sprintly.model.WorkflowStage;
import com.example.sprintly.repository.ProjectMemberRepository;
import com.example.sprintly.repository.ProjectRepository;
import com.example.sprintly.repository.TaskRepository;
import com.example.sprintly.repository.TaskStatusHistoryRepository;
import com.example.sprintly.repository.UserRepository;
import com.example.sprintly.repository.WorkflowStageRepository;
import com.example.sprintly.security.RbacService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProjectController {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private WorkflowStageRepository workflowStageRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskStatusHistoryRepository taskStatusHistoryRepository;
    @Autowired private RbacService rbacService;

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

    private MemberResponse toMemberResponse(ProjectMember pm) {
        return MemberResponse.builder()
                .userId(pm.getUser().getId())
                .email(pm.getUser().getEmail())
                .username(pm.getUser().getUsername())
                .role(pm.getRole().name())
                .joinedAt(pm.getJoinedAt() != null ? pm.getJoinedAt().toString() : null)
                .build();
    }

    // ── Project CRUD ─────────────────────────────────────────────────────────

    @GetMapping("/projects")
    public List<ProjectResponse> listProjects() {
        String email = rbacService.currentEmail();
        return projectRepository.findAllByMemberEmail(email)
                .stream().map(this::toProjectResponse).collect(Collectors.toList());
    }

    @PostMapping("/projects")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest req) {
        User user = userRepository.findByEmail(rbacService.currentEmail()).orElseThrow();

        Project project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .creator(user)
                .build();
        project = projectRepository.save(project);

        projectMemberRepository.save(ProjectMember.builder()
                .project(project).user(user).role(UserRole.owner).build());

        String[] defaultStages = {"To Do", "In Progress", "Review", "Done"};
        for (int i = 0; i < defaultStages.length; i++) {
            workflowStageRepository.save(WorkflowStage.builder()
                    .project(project).name(defaultStages[i]).stageOrder(i + 1).build());
        }

        return ResponseEntity.ok(toProjectResponse(projectRepository.findById(project.getId()).orElseThrow()));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        // must be a member to see the project
        rbacService.requireRole(id, UserRole.owner, UserRole.participant, UserRole.viewer);
        return projectRepository.findById(id)
                .map(p -> ResponseEntity.ok(toProjectResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id,
                                                          @Valid @RequestBody ProjectRequest req) {
        rbacService.requireRole(id, UserRole.owner);
        return projectRepository.findById(id).map(p -> {
            p.setName(req.getName());
            p.setDescription(req.getDescription());
            return ResponseEntity.ok(toProjectResponse(projectRepository.save(p)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        rbacService.requireRole(id, UserRole.owner);
        if (!projectRepository.existsById(id)) return ResponseEntity.notFound().build();
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Members ───────────────────────────────────────────────────────────────

    @GetMapping("/projects/{id}/members")
    public ResponseEntity<List<MemberResponse>> listMembers(@PathVariable Long id) {
        rbacService.requireRole(id, UserRole.owner, UserRole.participant, UserRole.viewer);
        if (!projectRepository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(
                projectMemberRepository.findByProjectId(id).stream()
                        .map(this::toMemberResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/projects/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        rbacService.requireRole(id, UserRole.owner);
        // Prevent removing self if owner
        User self = userRepository.findByEmail(rbacService.currentEmail()).orElseThrow();
        if (self.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot remove themselves");
        }
        projectMemberRepository.deleteByProjectIdAndUserId(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ── Workflow Stages ───────────────────────────────────────────────────────

    @GetMapping("/projects/{id}/stages")
    public ResponseEntity<List<WorkflowStageResponse>> listStages(@PathVariable Long id) {
        rbacService.requireRole(id, UserRole.owner, UserRole.participant, UserRole.viewer);
        if (!projectRepository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(
                workflowStageRepository.findByProjectIdOrderByStageOrderAsc(id)
                        .stream().map(this::toStageResponse).collect(Collectors.toList()));
    }

    @PostMapping("/projects/{id}/stages")
    public ResponseEntity<WorkflowStageResponse> createStage(@PathVariable Long id,
                                                              @Valid @RequestBody WorkflowStageRequest req) {
        rbacService.requireRole(id, UserRole.owner);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        WorkflowStage stage = WorkflowStage.builder()
                .project(project).name(req.getName()).stageOrder(req.getStageOrder()).build();
        return ResponseEntity.ok(toStageResponse(workflowStageRepository.save(stage)));
    }

    @DeleteMapping("/projects/{projectId}/stages/{stageId}")
    public ResponseEntity<Void> deleteStage(@PathVariable Long projectId, @PathVariable Long stageId) {
        rbacService.requireRole(projectId, UserRole.owner);
        WorkflowStage stage = workflowStageRepository.findById(stageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stage not found"));
        if (stage.getTasks() != null && !stage.getTasks().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a stage that contains tasks");
        }
        workflowStageRepository.deleteById(stageId);
        return ResponseEntity.noContent().build();
    }

    // ── Tasks under a project ─────────────────────────────────────────────────

    @GetMapping("/projects/{id}/tasks")
    public ResponseEntity<List<TaskResponse>> listTasks(@PathVariable Long id) {
        rbacService.requireRole(id, UserRole.owner, UserRole.participant, UserRole.viewer);
        if (!projectRepository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(
                taskRepository.findByProjectId(id).stream()
                        .map(this::toTaskResponse).collect(Collectors.toList()));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(@PathVariable Long projectId,
                                                    @Valid @RequestBody TaskRequest req) {
        rbacService.requireRole(projectId, UserRole.owner, UserRole.participant);

        User creator = userRepository.findByEmail(rbacService.currentEmail()).orElseThrow();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        WorkflowStage stage = workflowStageRepository.findById(req.getStageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stage not found"));

        User assignee = null;
        if (req.getAssigneeEmail() != null && !req.getAssigneeEmail().isBlank()) {
            assignee = userRepository.findByEmail(req.getAssigneeEmail()).orElse(null);
        }

        int position = taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getStage().getId().equals(req.getStageId()))
                .mapToInt(Task::getPosition).max().orElse(0) + 1;

        Task task = Task.builder()
                .project(project).stage(stage).title(req.getTitle())
                .description(req.getDescription())
                .priority(TaskPriority.valueOf(req.getPriority()))
                .dueDate(req.getDueDate()).assignee(assignee)
                .creator(creator).position(position).build();

        task = taskRepository.save(task);

        // Record initial status history
        taskStatusHistoryRepository.save(TaskStatusHistory.builder()
                .task(task).stage(stage).stageName(stage.getName())
                .enteredAt(OffsetDateTime.now()).build());

        return ResponseEntity.ok(toTaskResponse(task));
    }

    // ── Gantt data ─────────────────────────────────────────────────────────────

    @GetMapping("/projects/{id}/gantt")
    public ResponseEntity<List<GanttTaskResponse>> getGanttData(@PathVariable Long id) {
        rbacService.requireRole(id, UserRole.owner, UserRole.participant, UserRole.viewer);
        if (!projectRepository.existsById(id)) return ResponseEntity.notFound().build();

        List<Task> tasks = taskRepository.findByProjectId(id);
        List<Long> taskIds = tasks.stream().map(Task::getId).collect(Collectors.toList());
        List<TaskStatusHistory> allHistory = taskIds.isEmpty() ? List.of()
                : taskStatusHistoryRepository.findByTaskIdInOrderByEnteredAtAsc(taskIds);

        // Group history by task id
        var historyByTask = allHistory.stream()
                .collect(Collectors.groupingBy(h -> h.getTask().getId()));

        List<GanttTaskResponse> result = tasks.stream().map(t -> {
            List<TaskStatusHistoryResponse> history = historyByTask
                    .getOrDefault(t.getId(), List.of()).stream()
                    .map(h -> TaskStatusHistoryResponse.builder()
                            .stageId(h.getStage().getId())
                            .stageName(h.getStageName())
                            .enteredAt(h.getEnteredAt())
                            .build())
                    .collect(Collectors.toList());

            return GanttTaskResponse.builder()
                    .id(t.getId())
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .priority(t.getPriority().name())
                    .dueDate(t.getDueDate())
                    .assigneeEmail(t.getAssignee() != null ? t.getAssignee().getEmail() : null)
                    .currentStage(t.getStage().getName())
                    .createdAt(t.getCreatedAt())
                    .statusHistory(history)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Dashboard stats ───────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats() {
        String email = rbacService.currentEmail();
        List<Long> projectIds = projectMemberRepository.findProjectIdsByUserEmail(email);

        if (projectIds.isEmpty()) {
            return DashboardStatsResponse.builder()
                    .totalProjects(0).activeTasks(0).completedTasks(0)
                    .overdueTasks(0).completionPercent(0)
                    .stagesBreakdown(List.of()).build();
        }

        List<Task> allTasks = projectIds.stream()
                .flatMap(pid -> taskRepository.findByProjectId(pid).stream())
                .collect(Collectors.toList());

        // "done" stage = highest stageOrder per project
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
                        && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        double completionPercent = total == 0 ? 0 : Math.round((completed * 100.0 / total) * 10.0) / 10.0;

        // Per-stage breakdown (aggregate across all user's projects)
        List<DashboardStatsResponse.StageCount> breakdown = projectIds.stream()
                .flatMap(pid -> workflowStageRepository.findByProjectIdOrderByStageOrderAsc(pid).stream())
                .collect(Collectors.groupingBy(WorkflowStage::getName,
                        Collectors.summingInt(s -> s.getTasks() == null ? 0 : s.getTasks().size())))
                .entrySet().stream()
                .map(e -> DashboardStatsResponse.StageCount.builder()
                        .stageName(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalProjects(projectIds.size()).activeTasks(active)
                .completedTasks(completed).overdueTasks(overdue)
                .completionPercent(completionPercent).stagesBreakdown(breakdown).build();
    }
}