import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { StageProgress } from "@/components/board/StageProgress";
import { KanbanColumn } from "@/components/board/KanbanColumn";
import { TaskCard } from "@/components/board/TaskCard";
import { NewTaskModal } from "@/components/board/NewTaskModal";
import { TaskDetailPanel } from "@/components/board/TaskDetailPanel";
import { InviteModal } from "@/components/projects/InviteModal";
import { Button } from "@/components/ui/Button";
import { UserPlus, Kanban } from "lucide-react";
import { getProject } from "@/api/projects";
import { createTask } from "@/api/projects";
import { moveTask } from "@/api/tasks";
import { useProjectRole } from "@/hooks/useProjectRole";
import { useAuth } from "@/context/AuthContext";

const TEMPLATE_TASKS = [
  { title: "Define problem & requirements", description: "Clearly outline the problem you are solving, target users, and core requirements. Document functional and non-functional requirements.", priority: "high", category: "Planning" },
  { title: "Choose tech stack", description: "Evaluate and select the technologies, frameworks, and tools best suited for the project. Consider scalability, team expertise, and community support.", priority: "high", category: "Planning" },
  { title: "UI/UX design", description: "Create wireframes and mockups for all major screens. Focus on user flow, accessibility, and a clean intuitive interface.", priority: "high", category: "Design" },
  { title: "Database & system design", description: "Design the database schema, define entity relationships, and plan the overall system architecture including APIs and services.", priority: "high", category: "Design" },
  { title: "Create repo & project structure", description: "Initialize the repository, set up the folder structure, configure linting, formatting, and version control best practices.", priority: "medium", category: "Setup" },
  { title: "Setup frontend + backend", description: "Bootstrap the frontend and backend projects with the chosen frameworks. Configure build tools, environment variables, and dev servers.", priority: "medium", category: "Setup" },
  { title: "Build APIs (backend)", description: "Develop RESTful or GraphQL API endpoints for all core features. Implement proper error handling, validation, and response formats.", priority: "high", category: "Development" },
  { title: "Build UI (frontend)", description: "Implement all UI components and pages based on the design mockups. Ensure responsiveness and cross-browser compatibility.", priority: "high", category: "Development" },
  { title: "Add authentication", description: "Implement user registration, login, logout, and session management. Secure endpoints with proper authorization checks.", priority: "high", category: "Development" },
  { title: "Connect frontend + backend", description: "Integrate the frontend with backend APIs. Handle loading states, error responses, and data synchronization between client and server.", priority: "high", category: "Integration" },
  { title: "Fix bugs", description: "Identify and resolve bugs discovered during integration. Ensure data flows correctly across the entire application stack.", priority: "medium", category: "Integration" },
  { title: "Test features", description: "Write and run unit tests, integration tests, and end-to-end tests for all major features. Aim for good test coverage on critical paths.", priority: "medium", category: "Testing" },
  { title: "Handle edge cases", description: "Test and handle boundary conditions, invalid inputs, network failures, and unexpected user behavior gracefully.", priority: "medium", category: "Testing" },
  { title: "Deploy app (server + domain)", description: "Deploy the application to a hosting platform. Configure the domain, SSL certificates, CI/CD pipeline, and environment variables for production.", priority: "high", category: "Deployment" },
  { title: "Bug fixes", description: "Monitor the deployed application and address any production bugs or issues reported by users promptly.", priority: "low", category: "Maintenance" },
  { title: "Improvements", description: "Iterate on user feedback, optimize performance, and add enhancements to improve the overall user experience over time.", priority: "low", category: "Maintenance" },
];

// Custom collision detection: prefer column (droppable) detection, fall back to rect intersection
function customCollisionDetection(args) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
}

export function BoardPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { role, isOwner } = useProjectRole(projectId);

  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState(null);

  const [addTaskModal, setAddTaskModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const [activeTask, setActiveTask] = useState(null);
  const dragOriginStageId = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const templateApplied = useRef(false);

  const loadProject = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    return getProject(projectId)
      .then((p) => {
        setProject(p);
        setStages(p.stages ?? []);
        return p;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  // Apply template tasks when navigated with useTemplate flag
  useEffect(() => {
    if (!location.state?.useTemplate || templateApplied.current) return;
    if (!project || stages.length === 0) return;

    const todoStage = stages.find((s) => s.name.toLowerCase() === "to do");
    if (!todoStage) return;

    templateApplied.current = true;
    // Clear the state so refresh doesn't re-trigger
    window.history.replaceState({}, document.title);

    (async () => {
      for (const task of TEMPLATE_TASKS) {
        try {
          await createTask(projectId, {
            title: task.title,
            description: `[${task.category}] ${task.description}`,
            priority: task.priority,
            dueDate: null,
            assigneeEmail: null,
            stageId: todoStage.id,
          });
        } catch {
          // continue creating remaining tasks
        }
      }
      loadProject();
    })();
  }, [project, stages, location.state, projectId, loadProject]);

  const allTasks = stages.flatMap((s) => s.tasks ?? []);
  const activeIndex = stages.findIndex(
    (s) => (s.tasks ?? []).length > 0 && s !== stages[stages.length - 1]
  );

  function findTaskAndStage(taskId) {
    for (const stage of stages) {
      const task = (stage.tasks ?? []).find((t) => t.id === taskId);
      if (task) return { task, stage };
    }
    return null;
  }

  function handleDragStart({ active }) {
    const found = findTaskAndStage(active.id);
    if (found) {
      setActiveTask(found.task);
      dragOriginStageId.current = found.stage.id;
    }
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const activeInfo = findTaskAndStage(active.id);
    if (!activeInfo) return;

    // Determine target stage: if hovering over a task, use its parent stage
    let targetStageId = over.id;
    const overTaskInfo = findTaskAndStage(over.id);
    if (overTaskInfo) targetStageId = overTaskInfo.stage.id;

    // Don't update if already in same stage
    if (activeInfo.stage.id === targetStageId) return;

    setStages((prev) =>
      prev.map((s) => {
        if (s.id === activeInfo.stage.id)
          return { ...s, tasks: (s.tasks ?? []).filter((t) => t.id !== active.id) };
        if (s.id === targetStageId)
          return { ...s, tasks: [...(s.tasks ?? []), { ...activeInfo.task, stageId: targetStageId }] };
        return s;
      })
    );
  }

  async function handleDragEnd({ active, over }) {
    setActiveTask(null);
    if (!over) {
      // Dropped outside — reload to restore original position
      if (dragOriginStageId.current) loadProject();
      dragOriginStageId.current = null;
      return;
    }

    // Determine where the task ended up
    let targetStageId = over.id;
    const overTaskInfo = findTaskAndStage(over.id);
    if (overTaskInfo) targetStageId = overTaskInfo.stage.id;

    // Use the saved original stage, not the current one (which may have been moved by handleDragOver)
    const originalStageId = dragOriginStageId.current;
    dragOriginStageId.current = null;

    if (targetStageId !== originalStageId) {
      try {
        await moveTask(active.id, { stageId: targetStageId });
      } catch {
        loadProject();
      }
    }
  }

  function handleTaskCreated(newTask) {
    setStages((prev) =>
      prev.map((s) =>
        s.id === newTask.stageId ? { ...s, tasks: [...(s.tasks ?? []), newTask] } : s
      )
    );
  }

  function handleTaskUpdated(updated) {
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        tasks: (s.tasks ?? []).map((t) => (t.id === updated.id ? updated : t)),
      }))
    );
    setSelectedTask(updated);
  }

  function handleTaskDeleted(taskId) {
    setStages((prev) =>
      prev.map((s) => ({ ...s, tasks: (s.tasks ?? []).filter((t) => t.id !== taskId) }))
    );
    setSelectedTask(null);
  }

  function canDragTask(task) {
    if (!role) return false;
    if (role === "owner") return true;
    if (role === "participant") return task.assigneeEmail === user?.email;
    return false;
  }

  if (!projectId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Kanban className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-body text-slate-500 dark:text-slate-400">
          Select a project from the sidebar to open its board.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      {/* Main board */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {/* Board header */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-page-title font-semibold text-slate-900 dark:text-slate-50">
              {project ? project.name : "Board"}
            </h1>
            <p className="text-small text-slate-500 dark:text-slate-400">
              {loading
                ? "Loading…"
                : error
                ? <span className="text-red-600 dark:text-red-400">{error}</span>
                : project
                ? `${allTasks.length} task${allTasks.length !== 1 ? "s" : ""} · ${role ?? "…"}`
                : "No project selected"}
            </p>
          </div>
          {isOwner && (
            <Button
              variant="secondary"
              className="!py-2 !text-small self-start sm:self-auto"
              onClick={() => setShowInvite(true)}
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          )}
        </div>

        <StageProgress stages={stages} activeIndex={activeIndex >= 0 ? activeIndex : 0} />

        {!loading && stages.length === 0 && (
          <p className="mt-8 text-body text-slate-500 dark:text-slate-400">
            No workflow stages found for this project.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {stages.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                name={col.name}
                count={(col.tasks ?? []).length}
                canAdd={isOwner}
                onAddTask={() => setAddTaskModal({ stageId: col.id, stageName: col.name })}
              >
                {(col.tasks ?? []).map((t) => {
                  const ownerRole =
                    t.assigneeEmail === user?.email
                      ? "participant"
                      : role === "owner"
                      ? "owner"
                      : "viewer";
                  return (
                    <TaskCard
                      key={t.id}
                      id={t.id}
                      title={t.title}
                      ownerRole={ownerRole}
                      priority={t.priority}
                      dueLabel={t.dueDate ?? null}
                      isDragDisabled={!canDragTask(t)}
                      onClick={() => setSelectedTask(t)}
                    />
                  );
                })}
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                id={activeTask.id}
                title={activeTask.title}
                ownerRole="participant"
                priority={activeTask.priority}
                dueLabel={activeTask.dueDate ?? null}
                isDragDisabled
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <aside className="hidden w-72 shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 xl:block transition-colors duration-150">
          <TaskDetailPanel
            task={selectedTask}
            stages={stages}
            role={role}
            onClose={() => setSelectedTask(null)}
            onUpdated={handleTaskUpdated}
            onDeleted={handleTaskDeleted}
          />
        </aside>
      )}

      {addTaskModal && (
        <NewTaskModal
          projectId={projectId}
          stageId={addTaskModal.stageId}
          stageName={addTaskModal.stageName}
          onClose={() => setAddTaskModal(null)}
          onCreated={handleTaskCreated}
        />
      )}
      {showInvite && (
        <InviteModal projectId={projectId} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
