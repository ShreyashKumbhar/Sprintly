import { Link } from "react-router-dom";
import { Home, Frown } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-150">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Frown className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="text-center">
        <h1 className="font-display text-page-title font-semibold text-slate-900 dark:text-slate-50">
          Page not found
        </h1>
        <p className="mt-2 text-body text-slate-500 dark:text-slate-400">
          The route you requested does not exist.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-btn transition duration-150 hover:bg-blue-700 active:scale-[0.98]"
      >
        <Home className="h-4 w-4" /> Back home
      </Link>
    </div>
  );
}
