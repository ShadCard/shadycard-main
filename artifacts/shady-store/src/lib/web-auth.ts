/**
 * ShadyCard — Store web authentication helpers
 *
 * Two modes:
 *   - Telegram Mini App: identity comes from window.Telegram.WebApp.initData
 *   - Web (browser): identity comes from /api/auth/login or /api/auth/register (cookie + JWT token)
 *
 * `getAuthHeaders()` returns the headers to attach to every store API request.
 * `isLoggedIn()` checks if a web JWT is present (cookies + localStorage fallback).
 */

const TOKEN_KEY = "shadycard_web_token";

export function getApiBase(): string {
  return String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
}

function isTelegramWebApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = (window as any).Telegram?.WebApp;
  return !!(w && (w.initData || w.initDataUnsafe?.user?.id));
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function isTelegramMode(): boolean {
  return isTelegramWebApp();
}

export function isLoggedIn(): boolean {
  if (isTelegramMode()) return true;
  return !!getStoredToken();
}

/**
 * Build the headers to attach to every store API request.
 * In Telegram mode: attach x-telegram-init-data + x-telegram-id.
 * In Web mode: attach Authorization: Bearer <token> (cookie also sent automatically).
 */
export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Cache-Control": "no-cache",
    ...(extra || {}),
  };

  if (isTelegramMode()) {
    const w = (window as any).Telegram?.WebApp;
    if (w?.initData) {
      try {
        headers["x-telegram-init-data"] = encodeURIComponent(String(w.initData));
      } catch {
        headers["x-telegram-init-data"] = String(w.initData);
      }
    }
    const uid = w?.initDataUnsafe?.user?.id;
    if (uid) headers["x-telegram-id"] = String(uid);
  } else {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function register(email: string, password: string, username: string) {
  const res = await fetch(`${getApiBase()}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "فشل التسجيل");
  if (data?.token) setStoredToken(data.token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "فشل تسجيل الدخول");
  if (data?.token) setStoredToken(data.token);
  return data;
}

export async function logout() {
  try {
    await fetch(`${getApiBase()}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
    });
  } catch {
    // ignore network errors
  }
  setStoredToken(null);
}

export async function fetchMe(): Promise<any | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}
