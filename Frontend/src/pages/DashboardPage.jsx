import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getDashboardStats, listProjects } from "@/api/projects";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDashboardStats(), listProjects()])
      .then(([s, p]) => {
        setStats(s);
        setProjects(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (val) => (loading ? "—" : (val ?? "—"));

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
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-page-title font-semibold text-white">
          Dashboard
        </h1>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Active tasks
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-slate-deep">
              {fmt(stats?.activeTasks)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Completion
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-success">
              {loading ? "—" : stats ? `${stats.completionPercent}%` : "—"}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Overdue
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-error">
              {fmt(stats?.overdueTasks)}
            </p>
          </Card>
        </div>

        {projects.length > 0 ? (
          <Card className="mt-8 p-6">
            <h2 className="font-display text-section-title font-semibold text-slate-deep">
              Projects
            </h2>
            <ul className="mt-4 divide-y divide-gray-700">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-white">{project.name}</p>
                    {project.description && (
                      <p className="text-small text-gray-500">{project.description}</p>
                    )}
                  </div>
                  <Link
                    to={`/board/${project.id}`}
                    className="inline-flex items-center gap-1 text-small font-medium text-steel hover:underline"
                  >
                    Open board
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : !loading && (
          <Card className="mt-8 p-6">
            <h2 className="font-display text-section-title font-semibold text-slate-deep">
              No projects yet
            </h2>
            <p className="mt-1 text-body text-gray-600">
              Create a project to get started with your Kanban board.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
