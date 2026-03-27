import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { listProjects, getDashboardStats } from "@/api/projects";

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([listProjects(), getDashboardStats()]);
      setProjects(p);
      setStats(s);
    } catch {
      // silently ignore — individual components can show their own errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ProjectsContext.Provider value={{ projects, stats, loading, refresh }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
