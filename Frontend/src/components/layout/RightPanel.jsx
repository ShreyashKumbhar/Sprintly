import { MousePointerClick } from "lucide-react";

export function RightPanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 xl:flex transition-colors duration-150">
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <MousePointerClick className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-small text-slate-400 dark:text-slate-500 leading-relaxed">
          Click any task on the board to view and edit its details.
        </p>
      </div>
    </aside>
  );
}
