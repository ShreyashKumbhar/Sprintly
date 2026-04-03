import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

export function KanbanColumn({ id, name, count, children, onAddTask, canAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[260px] max-w-[300px] flex-1 flex-col rounded-xl border transition-colors duration-150 ${
        isOver
          ? "border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/10"
          : "border-slate-200 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/40"
      }`}
    >
      {/* Column header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-xl border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-semibold text-base text-slate-800 dark:text-slate-200">
            {name}
          </h3>
          <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-small font-medium text-slate-500 dark:text-slate-400">
            {count}
          </span>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={onAddTask}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition duration-150"
            title="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task list */}
      <div className="flex flex-1 flex-col gap-2 p-2 min-h-[120px]">
        {children}
      </div>
    </div>
  );
}