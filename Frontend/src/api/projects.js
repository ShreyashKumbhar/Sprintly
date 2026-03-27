import { apiFetch } from "@/api/client";

export function listProjects() {
  return apiFetch("/api/projects");
}

export function getProject(id) {
  return apiFetch(`/api/projects/${id}`);
}

export function createProject(payload) {
  return apiFetch("/api/projects", { method: "POST", json: payload });
}

export function updateProject(id, payload) {
  return apiFetch(`/api/projects/${id}`, { method: "PUT", json: payload });
}

export function deleteProject(id) {
  return apiFetch(`/api/projects/${id}`, { method: "DELETE" });
}

export function listStages(projectId) {
  return apiFetch(`/api/projects/${projectId}/stages`);
}

export function createStage(projectId, payload) {
  return apiFetch(`/api/projects/${projectId}/stages`, { method: "POST", json: payload });
}

export function listProjectTasks(projectId) {
  return apiFetch(`/api/projects/${projectId}/tasks`);
}

export function createTask(projectId, payload) {
  return apiFetch(`/api/projects/${projectId}/tasks`, { method: "POST", json: payload });
}

export function getDashboardStats() {
  return apiFetch("/api/dashboard/stats");
}
