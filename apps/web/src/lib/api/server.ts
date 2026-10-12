import "server-only";
import { ApiError, LANG, parseError, productQuery, toQuery } from "./shared";
import type { Brand, Category, CategoryNode, ProductCard, ProductDetail, ProductPage, ProductQuery } from "./types";

const BASE = (process.env.API_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

/** Catalog data is public and changes rarely: cache it briefly in the Next data cache. */
const REVALIDATE = 60;

async function get<T>(path: string, revalidate = REVALIDATE): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(0, null);
  }
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}

/** Same as `get` but returns `fallback` on any failure — for non-critical page sections. */
async function soft<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export const isNotFound = (e: unknown) => e instanceof ApiError && e.status === 404;

export const api = {
  categories: () => get<CategoryNode[]>(`/catalog/categories${toQuery({ lang: LANG })}`),
  category: (slug: string) =>
    get<Category>(`/catalog/categories/${encodeURIComponent(slug)}${toQuery({ lang: LANG })}`),
  brands: () => get<Brand[]>(`/catalog/brands`),
  products: (q: ProductQuery) => get<ProductPage>(`/catalog/products${productQuery(q)}`),
  product: (slug: string) =>
    get<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}${toQuery({ lang: LANG })}`),
  related: (slug: string) =>
    get<ProductCard[]>(`/catalog/products/${encodeURIComponent(slug)}/related${toQuery({ lang: LANG })}`),
  soft,
};
