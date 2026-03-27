import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StageProgress } from "@/components/board/StageProgress";
import { KanbanColumn } from "@/components/board/KanbanColumn";
import { TaskCard } from "@/components/board/TaskCard";
import { getProject } from "@/api/projects";

export function BoardPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getProject(projectId)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const stages = project?.stages ?? [];
  const totalTasks = stages.reduce((sum, s) => sum + (s.tasks?.length ?? 0), 0);
  const completedTasks = stages.length > 0
    ? (stages[stages.length - 1].tasks?.length ?? 0)
    : 0;
  const activeIndex = stages.findIndex((s) =>
    s.tasks && s.tasks.length > 0 && s !== stages[stages.length - 1]
  );

  return (
    <div className="min-h-full p-4 lg:p-6">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-page-title font-semibold text-white">
            {project ? project.name : "Board"}
          </h1>
          <p className="text-small text-gray-500">
            {loading
              ? "Loading…"
              : error
              ? error
              : project
              ? `${totalTasks} tasks · ${completedTasks} done`
              : "No project selected"}
          </p>
        </div>
      </div>

      <StageProgress activeIndex={activeIndex >= 0 ? activeIndex : 0} />

      <div className="flex gap-0 overflow-x-auto pb-4">
        {stages.map((col, colIndex) => (
          <div key={col.id} className="flex flex-1 items-stretch">
            {colIndex > 0 && (
              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-gray-600/40 to-transparent sm:block"
                aria-hidden
              />
            )}
            <KanbanColumn name={col.name} count={col.tasks?.length ?? 0}>
              {(col.tasks ?? []).map((t) => (
                <TaskCard
                  key={t.id}
                  title={t.title}
                  ownerRole={t.assigneeEmail ? "participant" : "viewer"}
                  dueLabel={t.dueDate ?? null}
                  onClick={() => {}}
                />
              ))}
            </KanbanColumn>
          </div>
        ))}

        {!loading && stages.length === 0 && (
          <p className="mt-8 text-body text-gray-500">
            No workflow stages found for this project.
          </p>
        )}
      </div>
    </div>
  );
}
