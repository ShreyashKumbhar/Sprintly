import { Outlet } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectsProvider } from "@/context/ProjectsContext";

export function AppShell() {
  return (
    <ProjectsProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProjectsProvider>
  );
}
