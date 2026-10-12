import type { ApiErrorBody, ProductQuery } from "./types";

export const LANG = "ru";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: ApiErrorBody["error"] | null;

  constructor(status: number, body: ApiErrorBody["error"] | null) {
    super(body?.message ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? (status === 0 ? "network" : "http_error");
    this.body = body;
  }
}

type QueryValue = string | number | boolean | undefined | null | readonly (string | number)[];

export function toQuery(params: Record<string, QueryValue>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function productQuery(q: ProductQuery): string {
  return toQuery({ lang: LANG, ...q } as Record<string, QueryValue>);
}

export async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody["error"] | null = null;
  try {
    const json = (await res.json()) as Partial<ApiErrorBody>;
    body = json.error ?? null;
  } catch {
    body = null;
  }
  return new ApiError(res.status, body);
}
