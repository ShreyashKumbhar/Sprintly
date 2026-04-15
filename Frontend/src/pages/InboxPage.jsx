import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Mail,
  CheckCircle2,
  Clock,
  UserPlus,
  Bell,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { myInvitations, acceptInvitation } from "@/api/invitations";
import { useProjects } from "@/context/ProjectsContext";

const UPDATES = [
  {
    title: "Gantt Chart Export",
    desc: "Export your project timeline to Excel with priority-based color coding and status-transition timelines.",
    tag: "Feature",
  },
  {
    title: "Invite by Username",
    desc: "You can now invite team members by their username or email address.",
    tag: "Improvement",
  },
  {
    title: "Drag & Drop Kanban",
    desc: "Move tasks between stages with intuitive drag-and-drop on the board.",
    tag: "Feature",
  },
];

export function InboxPage() {
  const navigate = useNavigate();
  const { refresh } = useProjects();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null); // token being accepted

  useEffect(() => {
    myInvitations()
      .then(setInvitations)
      .catch(() => setInvitations([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(token) {
    setAccepting(token);
    try {
      await acceptInvitation(token);
      setInvitations((prev) => prev.filter((i) => i.token !== token));
      await refresh();
    } catch {
      // silently fail
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-page-title font-semibold text-slate-900 dark:text-slate-50">
            Inbox
          </h1>
          <p className="mt-0.5 text-body text-slate-500 dark:text-slate-400">
            Invitations and platform updates
          </p>
        </div>

        {/* Invitations */}
        <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-display text-section-title font-semibold text-slate-900 dark:text-slate-50">
              Invitations
            </h2>
            {!loading && invitations.length > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                {invitations.length}
              </span>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-blue-600" />
                <span className="text-small text-slate-400">Loading…</span>
              </div>
            ) : invitations.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Inbox className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-body text-slate-500 dark:text-slate-400">
                  No pending invitations
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {invitations.map((inv) => (
                  <li key={inv.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {inv.projectName}
                          </p>
                        </div>
                        <p className="text-small text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {inv.inviterEmail}
                          </span>{" "}
                          invited you as{" "}
                          <span className="capitalize font-semibold text-blue-600 dark:text-blue-400">
                            {inv.role}
                          </span>
                        </p>
                        {inv.projectDescription && (
                          <p className="mt-1 text-small text-slate-400 dark:text-slate-500 truncate max-w-sm">
                            {inv.projectDescription}
                          </p>
                        )}
                        {inv.expiresAt && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Clock className="h-3 w-3" />
                            Expires {new Date(inv.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        className="!py-1.5 !text-small shrink-0"
                        disabled={accepting === inv.token}
                        onClick={() => handleAccept(inv.token)}
                      >
                        {accepting === inv.token ? (
                          "Joining…"
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Platform Updates */}
        <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
            <Megaphone className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <h2 className="font-display text-section-title font-semibold text-slate-900 dark:text-slate-50">
              Platform Updates
            </h2>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-700 p-6">
            {UPDATES.map(({ title, desc, tag }) => (
              <li key={title} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{title}</p>
                      <span className="inline-flex rounded-full bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
                        {tag}
                      </span>
                    </div>
                    <p className="text-small text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
