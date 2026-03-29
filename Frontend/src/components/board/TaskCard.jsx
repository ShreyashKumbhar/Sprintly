import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";

const priorityBorder = {
  low: "border-l-emerald-500",
  medium: "border-l-amber-400",
  high: "border-l-red-500",
};

const priorityDot = {
  low: "bg-emerald-500",
  medium: "bg-amber-400",
  high: "bg-red-500",
};

const priorityText = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

export function TaskCard({
  id,
  title,
  ownerRole = "participant",
  dueLabel,
  priority,
  onClick,
  isDragDisabled,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        type="button"
        onClick={onClick}
        {...(isDragDisabled ? {} : listeners)}
        className={`group w-full rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${
          priorityBorder[priority] ?? "border-l-slate-300 dark:border-l-slate-600"
        } bg-white dark:bg-slate-800 p-3 text-left shadow-card transition duration-150 ease-out hover:shadow-card-lift hover:border-slate-300 dark:hover:border-slate-600 ${
          !isDragDisabled ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <p className="font-medium text-card-title text-slate-800 dark:text-slate-200 line-clamp-2">
          {title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {priority && (
            <span
              className={`inline-flex items-center gap-1 text-small capitalize font-medium ${
                priorityText[priority] ?? "text-slate-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${priorityDot[priority] ?? "bg-slate-400"}`}
              />
              {priority}
            </span>
          )}
          {dueLabel && (
            <span className="inline-flex items-center gap-1 text-small text-slate-400 dark:text-slate-500">
              <Calendar className="h-3 w-3" aria-hidden />
              {dueLabel}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
