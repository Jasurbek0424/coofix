import { create } from "zustand";
import { getProducts } from "@/api/products";
import type { Product, ProductsResponse } from "@/types/product";

interface ProductsState {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetchParams: Record<string, unknown> | null;

  // Actions
  fetchProducts: (params?: {
    search?: string;
    category?: string;
    sub?: string;
    filter?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  clearProducts: () => void;
  setError: (error: string | null) => void;
}

export const useProducts = create<ProductsState>()((set, get) => ({
  products: [],
  total: 0,
  isLoading: false,
  error: null,
  lastFetchParams: null,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response: ProductsResponse = await getProducts(params);
      
      if (response.success) {
        set({
          products: response.products,
          total: response.total,
          isLoading: false,
          error: null,
          lastFetchParams: params,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch products",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching products",
      });
    }
  },

  clearProducts: () => {
    set({
      products: [],
      total: 0,
      error: null,
      lastFetchParams: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
