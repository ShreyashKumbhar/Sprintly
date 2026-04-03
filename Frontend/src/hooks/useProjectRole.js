import { useEffect, useState } from "react";
import { listMembers } from "@/api/projects";
import { useAuth } from "@/context/AuthContext";

/**
 * Returns the current user's role ('owner' | 'participant' | 'viewer' | null)
 * in the given project.
 */
export function useProjectRole(projectId) {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listMembers(projectId)
      .then((members) => {
        const me = members.find((m) => m.email === user.email);
        setRole(me?.role ?? null);
      })
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, [projectId, user?.email]);

  return {
    role,
    loading,
    isOwner: role === "owner",
    isParticipant: role === "participant",
    isViewer: role === "viewer",
    canEdit: role === "owner" || role === "participant",
  };
}