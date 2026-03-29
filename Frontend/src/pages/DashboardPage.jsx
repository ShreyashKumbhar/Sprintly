import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Plus, Calendar, AlertCircle,
  FolderKanban, CheckSquare, TrendingUp, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useProjects } from "@/context/ProjectsContext";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { myTasks } from "@/api/tasks";

const STATS = [
  {
    key: "totalProjects",
    label: "Projects",
    Icon: FolderKanban,
    numColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "activeTasks",
    label: "Active tasks",
    Icon: CheckSquare,
    numColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "completionPercent",
    label: "Completion",
    Icon: TrendingUp,
    suffix: "%",
    numColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "overdueTasks",
    label: "Overdue",
    Icon: AlertTriangle,
    numColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
];

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

  const today = new Date().toISOString().split("T")[0];
  const fmt = (key, suffix = "") =>
    loading ? "—" : stats ? `${stats[key] ?? "—"}${suffix}` : "—";

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-page-title font-semibold text-slate-900 dark:text-slate-50">
              Dashboard
            </h1>
            <p className="mt-0.5 text-body text-slate-500 dark:text-slate-400">
              Overview of your projects and tasks
            </p>
          </div>
          <Button variant="primary" className="!py-2 !text-small" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ key, label, Icon, suffix = "", numColor, iconBg, iconColor }) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-small font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <div className={`rounded-lg p-2 ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </div>
              <p className={`font-display text-dashboard-num font-semibold ${numColor}`}>
                {fmt(key, suffix)}
              </p>
            </div>
          ))}
        </div>

        {/* My Tasks */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-4">
            <h2 className="font-display text-section-title font-semibold text-slate-900 dark:text-slate-50">
              My Tasks
            </h2>
          </div>
          <div className="p-6">
            {tasksLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-blue-600" />
                <span className="text-small text-slate-400">Loading tasks…</span>
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-body text-slate-500 dark:text-slate-400">
                  No tasks assigned to you yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {assignedTasks.map((t) => {
                  const overdue = t.dueDate && t.dueDate < today;
                  return (
                    <li key={t.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200 text-body">
                          {t.title}
                        </p>
                        {t.dueDate && (
                          <span
                            className={`inline-flex items-center gap-1 text-small mt-0.5 ${
                              overdue ? "text-red-600 dark:text-red-400" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {overdue && <AlertCircle className="h-3 w-3" />}
                            <Calendar className="h-3 w-3" />
                            {t.dueDate}
                          </span>
                        )}
                      </div>
                      <Badge>{t.priority}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Projects */}
        {!loading && projects.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card">
            <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4">
              <h2 className="font-display text-section-title font-semibold text-slate-900 dark:text-slate-50">
                Projects
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition duration-150"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{project.name}</p>
                    {project.description && (
                      <p className="text-small text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/board/${project.id}`}
                    className="ml-4 inline-flex shrink-0 items-center gap-1 text-small font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open board <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : !loading && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-14 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="font-display text-section-title font-semibold text-slate-700 dark:text-slate-300">
              No projects yet
            </h2>
            <p className="mt-1 text-body text-slate-500 dark:text-slate-400">
              Create your first project to get started.
            </p>
            <Button
              variant="primary"
              className="mt-5 !py-2 !text-small"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4" /> Create project
            </Button>
          </div>
        )}
      </div>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
