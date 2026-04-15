import { apiFetch } from "@/api/client";

export const getInvitation = (token) => apiFetch(`/api/invitations/${token}`, { skipAuth: true });
export const acceptInvitation = (token) => apiFetch(`/api/invitations/${token}/accept`, { method: "POST" });
export const myInvitations = () => apiFetch("/api/invitations/mine");
