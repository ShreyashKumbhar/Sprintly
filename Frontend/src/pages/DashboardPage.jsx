import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function DashboardPage() {
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
        <p className="mt-1 max-w-xl text-body text-gray-400">
          Overview metrics and project health. Replace mock values with API data
          from your Spring services.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Active tasks
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-slate-deep">
              —
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Completion
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-success">
              —
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-small font-medium uppercase tracking-wide text-gray-500">
              Overdue
            </p>
            <p className="mt-2 font-display text-dashboard-num font-semibold text-semantic-error">
              —
            </p>
          </Card>
        </div>

        <Card className="mt-8 p-6">
          <h2 className="font-display text-section-title font-semibold text-slate-deep">
            Open board
          </h2>
          <p className="mt-1 text-body text-gray-600">
            Kanban layout follows the design system: columns, role-colored task
            stripes, and stage progress.
          </p>
          <Link
            to="/board/1"
            className="mt-4 inline-flex items-center gap-2 font-medium text-steel hover:underline"
          >
            Go to sample board
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
