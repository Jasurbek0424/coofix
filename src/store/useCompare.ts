// src/store/useCompare.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface CompareState {
  items: Product[];
  count: number; // ✨ FIX: count property qo'shildi
  
  // Actions
  toggleCompare: (product: Product) => void;
  isCompared: (productId: string) => boolean;
  getCount: () => number;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0, // ✨ FIX: count property qo'shildi
      
      toggleCompare: (product: Product) => {
        const { isCompared } = get();
        
        set((state) => {
          let newItems: Product[];
          if (isCompared(product._id)) {
            // O'chirish
            newItems = state.items.filter((item) => item._id !== product._id);
          } else {
            // Qo'shish
            newItems = [...state.items, product];
          }
          return { items: newItems, count: newItems.length };
        });
      },

      isCompared: (productId: string) => {
        return get().items.some((item) => item._id === productId);
      },

      getCount: () => {
        return get().count;
      },
    }),
    {
      name: "compare-storage",
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