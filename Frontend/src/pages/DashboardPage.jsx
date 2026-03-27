import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Calendar, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useProjects } from "@/context/ProjectsContext";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { myTasks } from "@/api/tasks";

export function DashboardPage() {
  const { projects, stats, loading } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    myTasks()
      .then(setAssignedTasks)
      .catch(() => setAssignedTasks([]))
      .finally(() => setTasksLoading(false));
  }, []);

  const fmt = (val) => (loading ? "—" : (val ?? "—"));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="min-h-full p-6 lg:p-8"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h1 className="font-display text-page-title font-semibold text-white">Dashboard</h1>
          <Button variant="primary" className="!py-2 !text-small" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">Projects</p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-slate-deep">{fmt(stats?.totalProjects)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">Active tasks</p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-slate-deep">{fmt(stats?.activeTasks)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">Completion</p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-success">
              {loading ? "—" : stats ? `${stats.completionPercent}%` : "—"}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">Overdue</p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-error">{fmt(stats?.overdueTasks)}</p>
          </Card>
        </div>

        {/* My assigned tasks (FR-22) */}
        <Card className="p-6">
          <h2 className="font-display text-section-title font-semibold text-slate-deep">My Tasks</h2>
          {tasksLoading ? (
            <p className="mt-3 text-small text-gray-500">Loading…</p>
          ) : assignedTasks.length === 0 ? (
            <p className="mt-3 text-small text-gray-500">No tasks assigned to you.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-200">
              {assignedTasks.map((t) => {
                const overdue = t.dueDate && t.dueDate < today;
                return (
                  <li key={t.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-deep text-body">{t.title}</p>
                      {t.dueDate && (
                        <span className={`inline-flex items-center gap-1 text-small ${overdue ? "text-semantic-error" : "text-gray-500"}`}>
                          {overdue && <AlertCircle className="h-3.5 w-3.5" />}
                          <Calendar className="h-3.5 w-3.5" /> {t.dueDate}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge>{t.priority}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Projects list */}
        {!loading && projects.length > 0 ? (
          <Card className="p-6">
            <h2 className="font-display text-section-title font-semibold text-slate-deep">Projects</h2>
            <ul className="mt-4 divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-deep">{project.name}</p>
                    {project.description && (
                      <p className="text-small text-gray-500">{project.description}</p>
                    )}
                  </div>
                  <Link to={`/board/${project.id}`}
                    className="inline-flex items-center gap-1 text-small font-medium text-steel hover:underline">
                    Open board <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : !loading && (
          <Card className="p-6">
            <h2 className="font-display text-section-title font-semibold text-slate-deep">No projects yet</h2>
            <p className="mt-1 text-body text-gray-600">Create your first project to get started.</p>
            <Button variant="primary" className="mt-4 !py-2 !text-small" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Create project
            </Button>
          </Card>
        )}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
