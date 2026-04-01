import { useCallback, useEffect, useMemo, useState } from "react";
import { listMembers } from "@/api/projects";
import { useAuth } from "@/context/AuthContext";
import {
  canMoveTask as canMoveTaskForRole,
  canManageTaskContent,
  canCreateTasks,
  canInviteMembers,
  canViewProjectInsights,
  canCommentOnTasks,
} from "@/lib/projectPermissions";

/**
 * Returns the current user's role ('owner' | 'participant' | 'viewer' | null)
 * in the given project, plus permission helpers aligned with RBAC spec.
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
        const me = members.find(
          (m) =>
            m.email?.toLowerCase() === user.email?.toLowerCase()
        );
        setRole(me?.role ?? null);
      })
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, [projectId, user?.email]);

  const canMoveTask = useCallback(
    (task) => canMoveTaskForRole(role, user?.email, task),
    [role, user?.email]
  );

  return useMemo(
    () => ({
      role,
      loading,
      isOwner: role === "owner",
      isParticipant: role === "participant",
      isViewer: role === "viewer",
      /** @deprecated use canManageTaskContent(role) via hook flags */
      canEdit: canManageTaskContent(role),
      canManageTaskContent: canManageTaskContent(role),
      canCreateTasks: canCreateTasks(role),
      canInviteMembers: canInviteMembers(role),
      canViewProjectInsights: canViewProjectInsights(role),
      canCommentOnTasks: canCommentOnTasks(role),
      canMoveTask,
    }),
    [role, loading, canMoveTask]
  );
}
