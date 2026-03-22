import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-deep px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
}
