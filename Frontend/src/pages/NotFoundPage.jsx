import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-deep px-4">
      <h1 className="font-display text-page-title font-semibold text-white">
        Page not found
      </h1>
      <p className="text-body text-gray-400">
        The route you requested does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg bg-steel px-4 py-2.5 text-sm font-medium text-white shadow-btn transition duration-150 ease-out hover:brightness-105 hover:-translate-y-px active:scale-[0.98]"
      >
        Back home
      </Link>
    </div>
  );
}
