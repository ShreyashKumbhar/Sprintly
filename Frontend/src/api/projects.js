import { apiFetch } from "@/api/client";

export const listProjects = () => apiFetch("/api/projects");
export const getProject = (id) => apiFetch(`/api/projects/${id}`);
export const createProject = (payload) => apiFetch("/api/projects", { method: "POST", json: payload });
export const updateProject = (id, payload) => apiFetch(`/api/projects/${id}`, { method: "PUT", json: payload });
export const deleteProject = (id) => apiFetch(`/api/projects/${id}`, { method: "DELETE" });

export const listStages = (projectId) => apiFetch(`/api/projects/${projectId}/stages`);
export const createStage = (projectId, payload) => apiFetch(`/api/projects/${projectId}/stages`, { method: "POST", json: payload });
export const deleteStage = (projectId, stageId) => apiFetch(`/api/projects/${projectId}/stages/${stageId}`, { method: "DELETE" });

export const listProjectTasks = (projectId) => apiFetch(`/api/projects/${projectId}/tasks`);
export const createTask = (projectId, payload) => apiFetch(`/api/projects/${projectId}/tasks`, { method: "POST", json: payload });

export const listMembers = (projectId) => apiFetch(`/api/projects/${projectId}/members`);
export const removeMember = (projectId, userId) => apiFetch(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });

export const sendInvite = (projectId, payload) => apiFetch(`/api/projects/${projectId}/invite`, { method: "POST", json: payload });

export const getDashboardStats = () => apiFetch("/api/dashboard/stats");
