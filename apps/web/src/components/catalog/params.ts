import type { ProductQuery, ProductSort } from "@/lib/api/types";
import { PER_PAGE } from "@/lib/site";

export type RawParams = Record<string, string | string[] | undefined>;

const SORTS: ProductSort[] = ["popular", "new", "price_asc", "price_desc", "name"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const flag = (v: string | string[] | undefined) => one(v) === "1" || one(v) === "true";
const rub = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) * 100 : undefined;
};

/** URL params (prices in whole rubles) → API query (prices in kopecks). */
export function parseCatalogParams(sp: RawParams): ProductQuery {
  const sort = one(sp.sort) as ProductSort | undefined;
  const page = Math.min(1000, Math.max(1, Number(one(sp.page)) || 1));
  const q = one(sp.q)?.trim().slice(0, 100);
  return {
    q: q && q.length >= 2 ? q : undefined,
    brand: many(sp.brand).filter((b) => /^[a-z0-9-]{1,120}$/.test(b)).slice(0, 20),
    price_min: rub(sp.price_min),
    price_max: rub(sp.price_max),
    in_stock: flag(sp.in_stock) || undefined,
    on_sale: flag(sp.on_sale) || undefined,
    is_new: flag(sp.is_new) || undefined,
    is_hit: flag(sp.is_hit) || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page,
    per_page: PER_PAGE,
  };
}

export function hasFilters(q: ProductQuery): boolean {
  return Boolean(q.brand?.length || q.price_min || q.price_max || q.in_stock || q.on_sale || q.is_new || q.is_hit);
}
