import { apiFetch, setStoredToken } from "@/api/client";

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, email: string }>}
 */
export async function signIn(credentials) {
  const data = await apiFetch("/api/auth/signin", {
    method: "POST",
    json: credentials,
    skipAuth: true,
  });
  if (data?.token) {
    setStoredToken(data.token);
  }
  return data;
}

/**
 * @param {{ email: string, password: string, fullName?: string }} payload
 */
export async function signUp(payload) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    json: payload,
    skipAuth: true,
  });
}

/**
 * Health check for JWT against backend (Spring `/api/test/me`).
 */
export async function fetchCurrentUser() {
  return apiFetch("/api/test/me");
}
