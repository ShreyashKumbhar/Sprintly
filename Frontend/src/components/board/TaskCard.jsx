import { Badge } from "@/components/ui/Badge";
import { Calendar } from "lucide-react";

const stripeByRole = {
  owner: "border-l-role-owner",
  participant: "border-l-role-participant",
  viewer: "border-l-role-viewer",
};

export function TaskCard({
  title,
  ownerRole = "participant",
  dueLabel,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-card transition duration-200 ease-out hover:shadow-card-lift ${stripeByRole[ownerRole] || stripeByRole.participant} border-l-4`}
    >
      <p className="font-medium text-card-title text-slate-deep">{title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge role={ownerRole}>
          {ownerRole.charAt(0).toUpperCase() + ownerRole.slice(1)}
        </Badge>
        {dueLabel && (
          <span className="inline-flex items-center gap-1 text-small text-gray-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {dueLabel}
          </span>
        )}
      </div>
    </button>
  );
}
