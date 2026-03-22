import { useParams } from "react-router-dom";
import { StageProgress } from "@/components/board/StageProgress";
import { KanbanColumn } from "@/components/board/KanbanColumn";
import { TaskCard } from "@/components/board/TaskCard";

const mockColumns = [
  {
    id: "todo",
    name: "To Do",
    tasks: [
      {
        id: 1,
        title: "Define workflow stages",
        ownerRole: "owner",
        dueLabel: "Mar 28",
      },
      {
        id: 2,
        title: "Invite team members",
        ownerRole: "participant",
        dueLabel: "Mar 30",
      },
    ],
  },
  {
    id: "progress",
    name: "In Progress",
    tasks: [
      {
        id: 3,
        title: "Hook task API to cards",
        ownerRole: "participant",
        dueLabel: null,
      },
    ],
  },
  {
    id: "review",
    name: "Review",
    tasks: [],
  },
  {
    id: "done",
    name: "Done",
    tasks: [
      {
        id: 4,
        title: "Project scaffold",
        ownerRole: "viewer",
        dueLabel: "Mar 20",
      },
    ],
  },
];

export function BoardPage() {
  const { projectId } = useParams();

  return (
    <div className="min-h-full p-4 lg:p-6">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-page-title font-semibold text-white">
            Board
          </h1>
          <p className="text-small text-gray-500">
            Project ID: {projectId ?? "none"} · Data is static until you connect
            `/api/projects/...` endpoints.
          </p>
        </div>
      </div>

      <StageProgress activeIndex={1} />

      <div className="flex gap-0 overflow-x-auto pb-4">
        {mockColumns.map((col, colIndex) => (
          <div key={col.id} className="flex flex-1 items-stretch">
            {colIndex > 0 && (
              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-gray-600/40 to-transparent sm:block"
                aria-hidden
              />
            )}
            <KanbanColumn name={col.name} count={col.tasks.length}>
              {col.tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  title={t.title}
                  ownerRole={t.ownerRole}
                  dueLabel={t.dueLabel}
                  onClick={() => {}}
                />
              ))}
            </KanbanColumn>
          </div>
        ))}
      </div>
    </div>
  );
}
