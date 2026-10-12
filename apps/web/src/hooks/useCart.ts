"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api/client";
import { fetchByIds, fetchCart, qk } from "@/lib/api/queries";
import { LANG, toQuery } from "@/lib/api/shared";
import type { Cart, CartLine } from "@/lib/api/types";
import { useAuth } from "@/stores/auth";
import { useGuestCart, useHydrated } from "@/stores/local";
import { toast } from "@/stores/toast";
import { errorMessage, t } from "@/i18n";
import { ApiError } from "@/lib/api/shared";

export interface CartView {
  ready: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  hasUnavailable: boolean;
  quantityOf: (productId: number) => number;
  add: (productId: number, qty?: number, opts?: { silent?: boolean; name?: string }) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clearGuest: () => void;
  isUser: boolean;
}

const lang = toQuery({ lang: LANG });

/**
 * One cart API for guests (localStorage ids+qty, prices fetched fresh via products-by-ids)
 * and signed-in users (server cart with optimistic updates).
 */
export function useCart(): CartView {
  const qc = useQueryClient();
  const status = useAuth((s) => s.status);
  const hydrated = useHydrated((s) => s.done);
  const isUser = status === "authenticated";
  const guest = useGuestCart();

  const server = useQuery({ queryKey: qk.cart, queryFn: fetchCart, enabled: isUser });

  const guestIds = useMemo(() => guest.lines.map((l) => l.product_id), [guest.lines]);
  const guestProducts = useQuery({
    queryKey: qk.byIds(guestIds),
    queryFn: ({ signal }) => fetchByIds(guestIds, signal),
    enabled: !isUser && hydrated && guestIds.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Drop guest lines whose product no longer exists / was deactivated.
  const removeGuest = guest.remove;
  useEffect(() => {
    if (isUser || !guestProducts.isSuccess || guestProducts.isPlaceholderData) return;
    const found = new Set(guestProducts.data.map((p) => p.id));
    guestIds.filter((id) => !found.has(id)).forEach(removeGuest);
  }, [isUser, guestProducts.isSuccess, guestProducts.isPlaceholderData, guestProducts.data, guestIds, removeGuest]);

  const lines: CartLine[] = useMemo(() => {
    if (isUser) return server.data?.items ?? [];
    const byId = new Map((guestProducts.data ?? []).map((p) => [p.id, p]));
    const out: CartLine[] = [];
    for (const l of guest.lines) {
      const p = byId.get(l.product_id);
      if (!p) continue;
      out.push({
        product: p,
        quantity: l.quantity,
        line_total_minor: p.price_minor * l.quantity,
        available: p.stock_level !== "out",
      });
    }
    return out;
  }, [isUser, server.data, guestProducts.data, guest.lines]);

  const ready =
    status !== "loading" &&
    hydrated &&
    (isUser ? server.isSuccess || server.isError : guestIds.length === 0 || guestProducts.isFetched);

  const count = isUser
    ? lines.reduce((s, l) => s + l.quantity, 0)
    : guest.lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = isUser
    ? (server.data?.subtotal_minor ?? 0)
    : lines.filter((l) => l.available).reduce((s, l) => s + l.line_total_minor, 0);

  const mutate = useMutation({
    mutationFn: async (v: { id: number; qty: number }) =>
      v.qty <= 0
        ? apiFetch<Cart>(`/cart/items/${v.id}${lang}`, { method: "DELETE" })
        : apiFetch<Cart>(`/cart/items/${v.id}${lang}`, { method: "PUT", body: { quantity: v.qty } }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: qk.cart });
      const prev = qc.getQueryData<Cart>(qk.cart);
      if (prev) {
        qc.setQueryData<Cart>(qk.cart, {
          ...prev,
          items:
            v.qty <= 0
              ? prev.items.filter((l) => l.product.id !== v.id)
              : prev.items.map((l) =>
                  l.product.id === v.id ? { ...l, quantity: v.qty, line_total_minor: l.product.price_minor * v.qty } : l,
                ),
        });
      }
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.cart, ctx.prev);
      toast({ title: errorMessage(e instanceof ApiError ? e.code : undefined), tone: "danger" });
    },
    onSuccess: (cart) => qc.setQueryData(qk.cart, cart),
  });

  const quantityOf = useCallback(
    (id: number) =>
      isUser
        ? (server.data?.items.find((l) => l.product.id === id)?.quantity ?? 0)
        : (guest.lines.find((l) => l.product_id === id)?.quantity ?? 0),
    [isUser, server.data, guest.lines],
  );

  const add: CartView["add"] = (id, qty = 1, opts) => {
    if (isUser) {
      mutate.mutate({ id, qty: Math.min(999, quantityOf(id) + qty) });
    } else {
      guest.add(id, qty);
    }
    if (!opts?.silent) {
      toast({ title: t("product.added"), description: opts?.name, action: { label: t("product.goToCart"), href: "/cart" } });
    }
  };

  return {
    ready,
    lines,
    count,
    subtotal,
    hasUnavailable: lines.some((l) => !l.available),
    quantityOf,
    add,
    setQty: (id, qty) => (isUser ? mutate.mutate({ id, qty }) : qty <= 0 ? guest.remove(id) : guest.set(id, qty)),
    remove: (id) => (isUser ? mutate.mutate({ id, qty: 0 }) : guest.remove(id)),
    clearGuest: guest.clear,
    isUser,
  };
}
