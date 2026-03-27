import { apiFetch } from "@/api/client";

export function getTask(id) {
  return apiFetch(`/api/tasks/${id}`);
}

export function updateTask(id, payload) {
  return apiFetch(`/api/tasks/${id}`, { method: "PUT", json: payload });
}

export function deleteTask(id) {
  return apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
}
