import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FolderKanban, Plus, Layers } from "lucide-react";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { useProjects } from "@/context/ProjectsContext";

export function Sidebar() {
  const { pathname } = useLocation();
  const { projects, loading } = useProjects();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:flex transition-colors duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-small font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Projects
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition duration-150"
            title="New project"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Project list */}
        <nav className="flex-1 overflow-auto px-2 py-2 space-y-0.5">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-blue-600" />
              <span className="text-small text-slate-400 dark:text-slate-500">Loading…</span>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="flex flex-col items-center px-3 py-8 text-center">
              <FolderKanban className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-small text-slate-400 dark:text-slate-500">No projects yet</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-1.5 text-small font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create one
              </button>
            </div>
          )}

          {projects.map((p) => {
            const to = `/board/${p.id}`;
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={p.id}
                to={to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-body transition duration-150 ${
                  active
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <FolderKanban
                  className={`h-4 w-4 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                />
                <span className="truncate">{p.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </>
  );
}
