import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FilterState {
  search: string;
  category: string | null;
  subcategory: string | null;
  filter: string | null; // hits, sales, promo, etc.
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest" | null;

  // Actions
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setSubcategory: (subcategory: string | null) => void;
  setFilter: (filter: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSortBy: (sortBy: FilterState["sortBy"]) => void;
  resetFilters: () => void;
  
  // Get query params
  getQueryParams: () => Record<string, string>;
}

const initialState = {
  search: "",
  category: null,
  subcategory: null,
  filter: null,
  minPrice: null,
  maxPrice: null,
  sortBy: null as FilterState["sortBy"],
};

export const useFilters = create<FilterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearch: (search: string) => set({ search }),
      
      setCategory: (category: string | null) => {
        set({ category, subcategory: null }); // Reset subcategory when category changes
      },
      
      setSubcategory: (subcategory: string | null) => set({ subcategory }),
      
      setFilter: (filter: string | null) => set({ filter }),
      
      setPriceRange: (min: number | null, max: number | null) =>
        set({ minPrice: min, maxPrice: max }),
      
      setSortBy: (sortBy: FilterState["sortBy"]) => set({ sortBy }),
      
      resetFilters: () => set(initialState),

      getQueryParams: () => {
        const state = get();
        const params: Record<string, string> = {};
        
        if (state.search) params.search = state.search;
        if (state.category) params.category = state.category;
        if (state.subcategory) params.sub = state.subcategory;
        if (state.filter) params.filter = state.filter;
        if (state.minPrice !== null) params.minPrice = state.minPrice.toString();
        if (state.maxPrice !== null) params.maxPrice = state.maxPrice.toString();
        if (state.sortBy) params.sortBy = state.sortBy;
        
        return params;
      },
    }),
    {
      name: "filters-storage",
      partialize: (state) => ({
        search: state.search,
        category: state.category,
        subcategory: state.subcategory,
        filter: state.filter,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        sortBy: state.sortBy,
      }),
    }
  )
);
