"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiFetch } from "@/lib/api/client";
import { qk } from "@/lib/api/queries";
import { ApiError, LANG, toQuery } from "@/lib/api/shared";
import type { ProductCard } from "@/lib/api/types";
import { useAuth } from "@/stores/auth";
import { useGuestFavorites } from "@/stores/local";
import { toast } from "@/stores/toast";
import { errorMessage } from "@/i18n";

export function useFavorites() {
  const qc = useQueryClient();
  const isUser = useAuth((s) => s.status === "authenticated");
  const guest = useGuestFavorites();

  const server = useQuery({
    queryKey: qk.favorites,
    queryFn: () => apiFetch<ProductCard[]>(`/favorites${toQuery({ lang: LANG })}`),
    enabled: isUser,
  });

  const ids = useMemo(
    () => new Set(isUser ? (server.data ?? []).map((p) => p.id) : guest.ids),
    [isUser, server.data, guest.ids],
  );

  const mutation = useMutation({
    mutationFn: (v: { product: ProductCard; on: boolean }) =>
      apiFetch<void>(`/favorites/${v.product.id}`, { method: v.on ? "PUT" : "DELETE" }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: qk.favorites });
      const prev = qc.getQueryData<ProductCard[]>(qk.favorites);
      qc.setQueryData<ProductCard[]>(qk.favorites, (cur = []) =>
        v.on ? [v.product, ...cur.filter((p) => p.id !== v.product.id)] : cur.filter((p) => p.id !== v.product.id),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.favorites, ctx.prev);
      toast({ title: errorMessage(e instanceof ApiError ? e.code : undefined), tone: "danger" });
    },
  });

  return {
    ids,
    count: ids.size,
    isUser,
    serverItems: server.data,
    serverLoading: server.isPending && isUser,
    has: (id: number) => ids.has(id),
    toggle: (product: ProductCard) => {
      const on = !ids.has(product.id);
      if (isUser) mutation.mutate({ product, on });
      else guest.toggle(product.id);
      return on;
    },
    clearGuest: guest.clear,
  };
}
