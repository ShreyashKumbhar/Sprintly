/**
 * Role rules for a single project (see product RBAC spec).
 * "owner" = project owner; "participant" / "viewer" = project member roles.
 */

function emailsMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Owner: any task. Participant: only tasks assigned to them. Viewer: none. */
export function canMoveTask(role, userEmail, task) {
  if (role === "owner") return true;
  if (role !== "participant") return false;
  return emailsMatch(userEmail, task?.assigneeEmail);
}

/** Create tasks, edit task fields, assign, delete tasks — owner only. */
export function canManageTaskContent(role) {
  return role === "owner";
}

export function canCreateTasks(role) {
  return role === "owner";
}

export function canInviteMembers(role) {
  return role === "owner";
}

/** Dashboard / board / insights (read paths). */
export function canViewProjectInsights(role) {
  return role === "owner" || role === "participant" || role === "viewer";
}

/** Comments (when UI/API exists): owner + participant. */
export function canCommentOnTasks(role) {
  return role === "owner" || role === "participant";
}
