"use client";

import { apiFetch } from "./client";
import { LANG, productQuery, toQuery } from "./shared";
import type { Cart, ProductCard, ProductPage, ProductQuery } from "./types";

export const qk = {
  cart: ["cart"] as const,
  favorites: ["favorites"] as const,
  byIds: (ids: number[]) => ["products-by-ids", [...ids].sort((a, b) => a - b).join(",")] as const,
  products: (q: ProductQuery) => ["products", q] as const,
  myOrders: ["orders", "my"] as const,
  order: (id: string) => ["order", id] as const,
};

export function fetchByIds(ids: number[], signal?: AbortSignal): Promise<ProductCard[]> {
  if (!ids.length) return Promise.resolve([]);
  const sorted = [...ids].sort((a, b) => a - b);
  return apiFetch<ProductCard[]>(`/catalog/products-by-ids${toQuery({ ids: sorted, lang: LANG })}`, { signal });
}

export function fetchProducts(q: ProductQuery, signal?: AbortSignal): Promise<ProductPage> {
  return apiFetch<ProductPage>(`/catalog/products${productQuery(q)}`, { signal });
}

export function fetchCart(): Promise<Cart> {
  return apiFetch<Cart>(`/cart${toQuery({ lang: LANG })}`);
}
