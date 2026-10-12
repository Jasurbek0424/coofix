"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { apiFetch, applySession, onSession, refreshSession } from "@/lib/api/client";
import { qk } from "@/lib/api/queries";
import { LANG, toQuery } from "@/lib/api/shared";
import type { Cart } from "@/lib/api/types";
import { useAuth } from "@/stores/auth";
import { hydrateLocalStores, useCompare, useGuestCart, useGuestFavorites, useHydrated } from "@/stores/local";
import { Toaster } from "./Toaster";

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, err) => {
          const status = (err as { status?: number }).status ?? 0;
          return status >= 500 || status === 0 ? count < 2 : false;
        },
      },
    },
  });
}

/** Restores the session from the refresh cookie and keeps auth/guest state in sync. */
function SessionBootstrap() {
  const qc = useQueryClient();
  const status = useAuth((s) => s.status);
  const hydrated = useHydrated((s) => s.done);
  const merging = useRef(false);

  useEffect(() => {
    const off = onSession((session) =>
      useAuth.setState(session ? { status: "authenticated", user: session.user } : { status: "guest", user: null }),
    );
    void hydrateLocalStores();
    void refreshSession();

    const ch = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("coofix-auth") : null;
    if (ch) {
      ch.onmessage = (e: MessageEvent<string>) => {
        if (e.data === "logout") {
          applySession(null);
          qc.removeQueries({ queryKey: qk.cart });
          qc.removeQueries({ queryKey: qk.favorites });
          qc.removeQueries({ queryKey: ["orders"] });
        } else if (e.data === "login") {
          void refreshSession();
        }
      };
    }

    // Keep guest stores in sync across tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "coofix-cart") void useGuestCart.persist.rehydrate();
      if (e.key === "coofix-favorites") void useGuestFavorites.persist.rehydrate();
      if (e.key === "coofix-compare") void useCompare.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      off();
      ch?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [qc]);

  // After sign-in (or session restore) move the guest cart & favorites to the account.
  useEffect(() => {
    if (status !== "authenticated" || !hydrated || merging.current) return;
    const lines = useGuestCart.getState().lines;
    const favs = useGuestFavorites.getState().ids;
    if (!lines.length && !favs.length) return;
    merging.current = true;
    (async () => {
      try {
        if (lines.length) {
          const cart = await apiFetch<Cart>(`/cart/merge${toQuery({ lang: LANG })}`, {
            method: "POST",
            body: { items: lines },
          });
          qc.setQueryData(qk.cart, cart);
          useGuestCart.getState().clear();
        }
        if (favs.length) {
          await Promise.allSettled(favs.map((id) => apiFetch<void>(`/favorites/${id}`, { method: "PUT" })));
          useGuestFavorites.getState().clear();
          await qc.invalidateQueries({ queryKey: qk.favorites });
        }
      } finally {
        merging.current = false;
      }
    })();
  }, [status, hydrated, qc]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(makeClient);
  return (
    <QueryClientProvider client={client}>
      <SessionBootstrap />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
