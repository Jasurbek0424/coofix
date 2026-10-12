import { lookup, t } from "@/i18n/ru";
import type { TokenOut, User } from "./types";

/**
 * HTTP client for the admin realm.
 * - Access token lives in module memory only (never storage).
 * - Refresh token is an httpOnly cookie scoped to /api/admin/auth; refresh/logout need X-Requested-With.
 * - On 401: one shared refresh, then a single retry; otherwise the session is dropped.
 */

const BASE = "/api";
const CSRF = { "X-Requested-With": "coofix" } as const;

export interface FieldError {
  loc: string[];
  type: string;
  msg: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: FieldError[];
  readonly extra: Record<string, unknown>;

  constructor(status: number, code: string, message: string, fields: FieldError[] = [], extra: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.extra = extra;
  }

  /** Localized, user-facing message. */
  get userMessage(): string {
    return lookup(t.errors, this.code) ?? t.errors.generic;
  }
}

let accessToken: string | null = null;
let refreshing: Promise<TokenOut | null> | null = null;
type SessionListener = (user: User | null) => void;
const listeners = new Set<SessionListener>();

export function onSessionChange(fn: SessionListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(user: User | null) {
  for (const fn of listeners) fn(user);
}

export function setSession(tok: TokenOut | null) {
  accessToken = tok?.access_token ?? null;
  emit(tok?.user ?? null);
}

async function parseError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON (proxy error page, etc.) */
  }
  const err = (body as { error?: { code?: string; message?: string; fields?: FieldError[] } } | null)?.error;
  if (err?.code) {
    const { code, message, fields, ...extra } = err as { code: string; message?: string; fields?: FieldError[] } & Record<string, unknown>;
    return new ApiError(res.status, code, message ?? code, fields ?? [], extra);
  }
  return new ApiError(res.status, res.status >= 500 ? "internal_error" : "http_error", res.statusText);
}

/** Single-flight refresh: concurrent 401s share one /refresh call (the cookie rotates). */
export function refreshSession(): Promise<TokenOut | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE}/admin/auth/refresh`, {
        method: "POST",
        credentials: "same-origin",
        headers: CSRF,
      });
      if (!res.ok) {
        setSession(null);
        return null;
      }
      const tok = (await res.json()) as TokenOut;
      setSession(tok);
      return tok;
    } catch {
      // Network failure: keep the current state, let the caller surface the error.
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

export function buildQuery(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  try {
    return await fetch(`${BASE}${path}${buildQuery(opts.query)}`, {
      method: opts.method ?? "GET",
      headers,
      body,
      signal: opts.signal,
      credentials: "same-origin",
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(0, "network", t.errors.network);
  }
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await send(path, opts);
  if (res.status === 401 && !path.startsWith("/admin/auth/login")) {
    const tok = await refreshSession();
    if (tok) res = await send(path, opts);
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function login(email: string, password: string): Promise<TokenOut> {
  const tok = await api<TokenOut>("/admin/auth/login", { method: "POST", body: { email, password } });
  setSession(tok);
  return tok;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/admin/auth/logout`, { method: "POST", credentials: "same-origin", headers: CSRF });
  } finally {
    setSession(null);
  }
}

/** Server-side field error for a form path like ["body","price_minor"] → "price_minor". */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError)) return {};
  const out: Record<string, string> = {};
  for (const f of err.fields) {
    const path = f.loc.filter((p) => p !== "body").join(".");
    if (path && !out[path]) out[path] = translateFieldError(f);
  }
  return out;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.userMessage;
  return t.errors.generic;
}

function translateFieldError(f: FieldError): string {
  const msg = f.msg.replace(/^Value error, /, "");
  if (f.type === "value_error") {
    if (/translation is required/.test(msg)) return t.validation.required;
    if (/old_price/.test(msg)) return t.validation.oldPrice;
    if (/email/i.test(msg)) return t.validation.email;
    if (/phone/i.test(msg)) return msg;
  }
  return lookup(t.fieldErrorTypes, f.type) ?? msg;
}
