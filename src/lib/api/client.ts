import { API_BASE } from "./config";

const BASE_URL = API_BASE;

export const TOKEN_KEY = "ptik_token";
export const REFRESH_TOKEN_KEY = "ptik_refresh_token";

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// "expired" = re-login required; "transient" = backend down, keep session.
interface RefreshResult {
  ok: boolean;
  token?: string;
  reason?: "expired" | "transient";
}

// Single-flight refresh: concurrent 401s share ONE refresh call so token
// rotation on the server doesn't race parallel requests.
let refreshPromise: Promise<RefreshResult> | null = null;

async function refreshAccessToken(): Promise<RefreshResult> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { ok: false, reason: "expired" };
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.status >= 500) return { ok: false, reason: "transient" };
    if (!res.ok) return { ok: false, reason: "expired" };
    const body = await res.json().catch(() => ({}));
    const pair = body?.data;
    if (!pair?.access_token) return { ok: false, reason: "expired" };
    setTokens(pair.access_token, pair.refresh_token);
    return { ok: true, token: pair.access_token as string };
  } catch {
    return { ok: false, reason: "transient" };
  }
}

function getFreshToken(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const SERVICE_UNAVAILABLE_MESSAGE = "Server sedang tidak tersedia. Coba lagi sebentar.";
const REQUEST_TIMEOUT_MS = 30_000;

function forceLogout() {
  clearTokens();
  window.location.href = "/admin/ptik/login";
}

async function request<T>(path: string, init?: RequestInit, allowRetry = true): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      throw new ApiError("TIMEOUT", "Permintaan habis waktu. Periksa koneksi internet.", 0);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401 && allowRetry) {
    const refreshed = await getFreshToken();
    if (refreshed.ok) {
      return request<T>(path, init, false);
    }
    if (refreshed.reason === "transient") {
      throw new ApiError("SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE, 503);
    }
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) forceLogout();
    throw new ApiError(
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `HTTP ${res.status}`,
      res.status,
    );
  }

  return (body.data ?? null) as T; // unwrap the { data } envelope
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
