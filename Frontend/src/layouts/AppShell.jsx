import { Outlet } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { ProjectsProvider } from "@/context/ProjectsContext";

export function AppShell() {
  return (
    <ProjectsProvider>
      <div className="flex min-h-screen flex-col bg-slate-deep">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <RightPanel />
        </div>
      </div>
    </ProjectsProvider>
  );
}
