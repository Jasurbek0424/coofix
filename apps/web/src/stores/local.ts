"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { COMPARE_LIMIT } from "@/lib/site";
import type { CartLineIn } from "@/lib/api/types";

/**
 * Guest-side state persisted in localStorage. Only ids and quantities are stored —
 * never prices; those always come fresh from the API.
 * Stores use `skipHydration` and are rehydrated after mount (see StoreHydrator) so the
 * server HTML and the first client render match.
 */

const storage = createJSONStorage(() => localStorage);

const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;
const clampQty = (q: number) => Math.min(999, Math.max(1, Math.floor(q)));

function sanitizeLines(raw: unknown): CartLineIn[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Map<number, number>();
  for (const l of raw as Partial<CartLineIn>[]) {
    if (l && isId(l.product_id) && Number.isFinite(l.quantity)) {
      seen.set(l.product_id, clampQty(Number(l.quantity)));
    }
  }
  return [...seen].slice(0, 100).map(([product_id, quantity]) => ({ product_id, quantity }));
}

function sanitizeIds(raw: unknown, max: number): number[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter(isId))].slice(0, max);
}

interface GuestCart {
  lines: CartLineIn[];
  set: (productId: number, qty: number) => void;
  add: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

export const useGuestCart = create<GuestCart>()(
  persist(
    (set) => ({
      lines: [],
      set: (id, qty) =>
        set((s) => ({
          lines: s.lines.some((l) => l.product_id === id)
            ? s.lines.map((l) => (l.product_id === id ? { ...l, quantity: clampQty(qty) } : l))
            : [...s.lines, { product_id: id, quantity: clampQty(qty) }],
        })),
      add: (id, qty) =>
        set((s) => {
          const cur = s.lines.find((l) => l.product_id === id);
          return cur
            ? { lines: s.lines.map((l) => (l.product_id === id ? { ...l, quantity: clampQty(l.quantity + qty) } : l)) }
            : { lines: [...s.lines, { product_id: id, quantity: clampQty(qty) }].slice(-100) };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.product_id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "coofix-cart",
      version: 1,
      storage,
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines }),
      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeLines((persisted as { lines?: unknown } | undefined)?.lines),
      }),
    },
  ),
);

interface IdList {
  ids: number[];
  toggle: (id: number) => boolean;
  remove: (id: number) => void;
  clear: () => void;
}

function idListStore(name: string, max: number) {
  return create<IdList>()(
    persist(
      (set, get) => ({
        ids: [],
        toggle: (id) => {
          const has = get().ids.includes(id);
          if (!has && get().ids.length >= max) return false;
          set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
          return true;
        },
        remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
        clear: () => set({ ids: [] }),
      }),
      {
        name,
        version: 1,
        storage,
        skipHydration: true,
        partialize: (s) => ({ ids: s.ids }),
        merge: (persisted, current) => ({
          ...current,
          ids: sanitizeIds((persisted as { ids?: unknown } | undefined)?.ids, max),
        }),
      },
    ),
  );
}

export const useGuestFavorites = idListStore("coofix-favorites", 500);
export const useCompare = idListStore("coofix-compare", COMPARE_LIMIT);

/** True once persisted stores have been read from localStorage. */
export const useHydrated = create<{ done: boolean }>(() => ({ done: false }));

export async function hydrateLocalStores(): Promise<void> {
  await Promise.all([
    useGuestCart.persist.rehydrate(),
    useGuestFavorites.persist.rehydrate(),
    useCompare.persist.rehydrate(),
  ]);
  useHydrated.setState({ done: true });
}
