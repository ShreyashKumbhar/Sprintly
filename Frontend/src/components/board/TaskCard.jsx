import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Calendar } from "lucide-react";

const stripeByRole = {
  owner: "border-l-role-owner",
  participant: "border-l-role-participant",
  viewer: "border-l-role-viewer",
};

const priorityDot = {
  low: "bg-semantic-success",
  medium: "bg-yellow-400",
  high: "bg-semantic-error",
};

export function TaskCard({ id, title, ownerRole = "participant", dueLabel, priority, onClick, isDragDisabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        type="button"
        onClick={onClick}
        {...(isDragDisabled ? {} : listeners)}
        className={`group w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card transition duration-200 ease-out hover:shadow-card-lift ${stripeByRole[ownerRole] || stripeByRole.participant} border-l-4 ${!isDragDisabled ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <p className="font-medium text-card-title text-slate-deep">{title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge role={ownerRole}>
            {ownerRole.charAt(0).toUpperCase() + ownerRole.slice(1)}
          </Badge>
          {priority && (
            <span className="inline-flex items-center gap-1 text-small text-gray-500 capitalize">
              <span className={`h-2 w-2 rounded-full ${priorityDot[priority] ?? "bg-gray-400"}`} />
              {priority}
            </span>
          )}
          {dueLabel && (
            <span className="inline-flex items-center gap-1 text-small text-gray-500">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {dueLabel}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
