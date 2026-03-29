import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4 py-12 transition-colors duration-150">
      <div className="w-full max-w-sm animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
}
