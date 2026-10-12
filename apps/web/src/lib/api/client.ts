"use client";

import { ApiError, parseError } from "./shared";
import type { TokenOut } from "./types";

/**
 * Browser API client.
 * - Access token lives only in this module's memory (never in storage).
 * - The refresh token is an httpOnly cookie (path /api/auth) managed by the server.
 * - Refresh is single-flight within a tab and serialized across tabs with the Web Locks API,
 *   because the server revokes the whole session family when a rotated token is replayed.
 */

let accessToken: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<TokenOut | null> | null = null;

type SessionListener = (session: TokenOut | null) => void;
const listeners = new Set<SessionListener>();

export function onSession(fn: SessionListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function hasAccessToken(): boolean {
  return accessToken !== null;
}

export function applySession(session: TokenOut | null): void {
  accessToken = session?.access_token ?? null;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
  if (session) {
    // Renew a minute before expiry so requests rarely hit a 401.
    const ms = Math.max(30, session.expires_in - 60) * 1000;
    refreshTimer = setTimeout(() => void refreshSession(), ms);
  }
  listeners.forEach((fn) => fn(session));
}

const CSRF = { "X-Requested-With": "coofix" } as const;

async function doRefresh(): Promise<TokenOut | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      headers: CSRF,
    });
    if (!res.ok) return null;
    return (await res.json()) as TokenOut;
  } catch {
    return null;
  }
}

/** Restore/renew the session from the refresh cookie. Resolves to null for guests. */
export function refreshSession(): Promise<TokenOut | null> {
  if (inflight) return inflight;
  const run = async () => {
    const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
    const session = locks
      ? await locks.request("coofix-auth-refresh", () => doRefresh())
      : await doRefresh();
    applySession(session);
    return session;
  };
  inflight = run().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: CSRF });
  } finally {
    applySession(null);
  }
}

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

/** JSON fetch against same-origin /api with bearer auth and one retry after refresh on 401. */
export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const send = () => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`/api${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: "same-origin",
      signal: opts.signal,
    });
  };

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && accessToken) {
      const session = await refreshSession();
      if (session) res = await send();
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, null);
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
