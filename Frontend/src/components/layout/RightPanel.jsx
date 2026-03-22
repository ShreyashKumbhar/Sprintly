import { PanelRight } from "lucide-react";

export function RightPanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-gray-700 bg-graphite/80 xl:flex">
      <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
        <PanelRight className="h-4 w-4 text-gray-500" />
        <span className="text-small font-medium text-gray-400">Details</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="text-small text-gray-500">
          Select a task to show comments, assignee, and activity. Hook this panel
          to task endpoints from the backend.
        </p>
      </div>
    </aside>
  );
}
