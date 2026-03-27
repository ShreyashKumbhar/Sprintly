import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { useProjects } from "@/context/ProjectsContext";

export function Sidebar() {
  const { pathname } = useLocation();
  const { projects, loading } = useProjects();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-700 bg-graphite lg:flex">
        <div className="flex items-center justify-between border-b border-gray-700 px-3 py-3">
          <span className="text-small font-semibold uppercase tracking-wide text-gray-500">
            Projects
          </span>
          <Button
            type="button"
            variant="ghost"
            className="!p-2"
            title="New project"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-auto p-2">
          {loading && (
            <p className="px-3 py-2 text-small text-gray-500">Loading…</p>
          )}
          {!loading && projects.length === 0 && (
            <p className="px-3 py-2 text-small text-gray-500">
              No projects yet.
            </p>
          )}
          {projects.map((p) => {
            const to = `/board/${p.id}`;
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={p.id}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-body transition duration-150 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <FolderKanban className="h-4 w-4 shrink-0 opacity-70" />
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
