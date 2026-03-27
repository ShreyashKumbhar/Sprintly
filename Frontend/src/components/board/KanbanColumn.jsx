import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/Button";

export function KanbanColumn({ id, name, count, children, onAddTask, canAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const taskIds = Array.isArray(children)
    ? children.map((c) => c?.props?.id).filter(Boolean)
    : [];

  return (
    <div className="flex min-w-[260px] max-w-[320px] flex-1 flex-col rounded-xl bg-gray-200/90">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-xl border-b border-gray-300/80 bg-gray-200/95 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-semibold text-section-title text-slate-deep">{name}</h3>
          <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-small font-medium text-gray-600">
            {count}
          </span>
        </div>
        {canAdd && (
          <Button type="button" variant="ghost"
            className="!h-8 !w-8 !min-w-0 !p-0 text-slate-deep hover:bg-white/60"
            title="Add task" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 p-2 transition-colors duration-150 ${isOver ? "bg-steel/10 rounded-b-xl" : ""}`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}
