import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface FavoritesState {
  items: Product[];
  count: number; // ✨ FIX: count property qo'shildi
  isLoading: boolean;
  error: string | null;

  // Actions
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  toggleFavorite: (product: Product) => void;

  // Check if product is favorite
  isFavorite: (productId: string) => boolean;
  getCount: () => number;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0, // ✨ FIX: count property qo'shildi
      isLoading: false,
      error: null,

      addFavorite: (product: Product) => {
        const { items } = get();
        if (!items.find((item) => item._id === product._id)) {
          const newItems = [...items, product];
          set({ items: newItems, count: newItems.length });
        }
      },

      removeFavorite: (productId: string) => {
        const { items } = get();
        const newItems = items.filter((item) => item._id !== productId);
        set({ items: newItems, count: newItems.length });
      },

      clearFavorites: () => {
        set({ items: [], count: 0, error: null });
      },

      toggleFavorite: (product: Product) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(product._id)) {
          removeFavorite(product._id);
        } else {
          addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item._id === productId);
      },

      getCount: () => {
        return get().count;
      },
    }),
    {
      name: "favorites-storage",
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        // ✨ FIX: Reload qilinganda count ni qayta hisoblash
        if (state?.items) {
          state.count = state.items.length;
        }
      },
    }
  )
);
