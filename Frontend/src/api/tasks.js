import { apiFetch } from "@/api/client";

export const getTask = (id) => apiFetch(`/api/tasks/${id}`);
export const updateTask = (id, payload) => apiFetch(`/api/tasks/${id}`, { method: "PUT", json: payload });
export const moveTask = (id, payload) => apiFetch(`/api/tasks/${id}/move`, { method: "PATCH", json: payload });
export const deleteTask = (id) => apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
export const myTasks = () => apiFetch("/api/tasks/mine");
