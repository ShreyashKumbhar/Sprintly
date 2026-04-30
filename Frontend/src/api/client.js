const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/api";

// Normalize trailing slash so `${API_BASE}${path}` does not produce `//api/...`.
const API_BASE = rawApiBase.replace(/\/+$/, "");

const TOKEN_KEY = "sprintly_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * @param {string} path - e.g. "/api/test/me"
 * @param {RequestInit & { json?: unknown, skipAuth?: boolean }} [options]
 */
export async function apiFetch(path, options = {}) {
  const { json, skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(
      typeof data === "string" && data ? data : res.statusText
    );
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
