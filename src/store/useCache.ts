import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Product } from "@/types/product";

interface CacheState {
  // Categories cache
  categories: Category[];
  categoriesTree: Category[];
  categoriesTimestamp: number | null;
  
  // Products cache by category
  categoryProducts: Record<string, {
    products: Product[];
    timestamp: number;
  }>;
  
  // Products cache by filter
  filteredProducts: Record<string, {
    products: Product[];
    total: number;
    timestamp: number;
  }>;
  
  // Individual products cache
  products: Record<string, {
    product: Product;
    timestamp: number;
  }>;
  
  // Cache expiration time (5 minutes)
  cacheExpiry: number;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setCategoriesTree: (tree: Category[]) => void;
  setCategoryProducts: (categorySlug: string, products: Product[]) => void;
  setFilteredProducts: (key: string, products: Product[], total: number) => void;
  setProduct: (slug: string, product: Product) => void;
  
  // Getters with cache check
  getCategories: () => Category[] | null;
  getCategoriesTree: () => Category[] | null;
  getCategoryProducts: (categorySlug: string) => Product[] | null;
  getFilteredProducts: (key: string) => { products: Product[]; total: number } | null;
  getProduct: (slug: string) => Product | null;
  
  // Clear expired cache
  clearExpiredCache: () => void;
  clearAllCache: () => void;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useCache = create<CacheState>()(
  persist(
    (set, get) => ({
      categories: [],
      categoriesTree: [],
      categoriesTimestamp: null,
      categoryProducts: {},
      filteredProducts: {},
      products: {},
      cacheExpiry: CACHE_EXPIRY,
      
      setCategories: (categories) => {
        set({
          categories,
          categoriesTimestamp: Date.now(),
        });
      },
      
      setCategoriesTree: (tree) => {
        set({
          categoriesTree: tree,
          categoriesTimestamp: Date.now(),
        });
      },
      
      setCategoryProducts: (categorySlug, products) => {
        set((state) => ({
          categoryProducts: {
            ...state.categoryProducts,
            [categorySlug]: {
              products,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      setFilteredProducts: (key, products, total) => {
        set((state) => ({
          filteredProducts: {
            ...state.filteredProducts,
            [key]: {
              products,
              total,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      setProduct: (slug, product) => {
        set((state) => ({
          products: {
            ...state.products,
            [slug]: {
              product,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      getCategories: () => {
        const state = get();
        if (state.categories.length > 0 && state.categoriesTimestamp) {
          const age = Date.now() - state.categoriesTimestamp;
          if (age < state.cacheExpiry) {
            return state.categories;
          }
        }
        return null;
      },
      
      getCategoriesTree: () => {
        const state = get();
        if (state.categoriesTree.length > 0 && state.categoriesTimestamp) {
          const age = Date.now() - state.categoriesTimestamp;
          if (age < state.cacheExpiry) {
            return state.categoriesTree;
          }
        }
        return null;
      },
      
      getCategoryProducts: (categorySlug) => {
        const state = get();
        const cached = state.categoryProducts[categorySlug];
        if (cached) {
          const age = Date.now() - cached.timestamp;
          if (age < state.cacheExpiry) {
            return cached.products;
          }
        }
        return null;
      },
      
      getFilteredProducts: (key) => {
        const state = get();
        const cached = state.filteredProducts[key];
        if (cached) {
          const age = Date.now() - cached.timestamp;
          if (age < state.cacheExpiry) {
            return { products: cached.products, total: cached.total };
          }
        }
        return null;
      },
      
      getProduct: (slug) => {
        const state = get();
        const cached = state.products[slug];
        if (cached) {
          const age = Date.now() - cached.timestamp;
          if (age < state.cacheExpiry) {
            return cached.product;
          }
        }
        return null;
      },
      
      clearExpiredCache: () => {
        const state = get();
        const now = Date.now();
        let hasExpired = false;
        
        // Check if any cache is expired
        const expiredCategoryProducts = Object.entries(state.categoryProducts).some(
          ([, value]) => now - value.timestamp >= state.cacheExpiry
        );
        const expiredFilteredProducts = Object.entries(state.filteredProducts).some(
          ([, value]) => now - value.timestamp >= state.cacheExpiry
        );
        const expiredProducts = Object.entries(state.products).some(
          ([, value]) => now - value.timestamp >= state.cacheExpiry
        );
        
        if (!expiredCategoryProducts && !expiredFilteredProducts && !expiredProducts) {
          return; // No expired cache, skip update
        }
        
        // Clear expired category products
        const validCategoryProducts: Record<string, { products: Product[]; timestamp: number }> = {};
        Object.entries(state.categoryProducts).forEach(([key, value]) => {
          if (now - value.timestamp < state.cacheExpiry) {
            validCategoryProducts[key] = value;
          } else {
            hasExpired = true;
          }
        });
        
        // Clear expired filtered products
        const validFilteredProducts: Record<string, { products: Product[]; total: number; timestamp: number }> = {};
        Object.entries(state.filteredProducts).forEach(([key, value]) => {
          if (now - value.timestamp < state.cacheExpiry) {
            validFilteredProducts[key] = value;
          } else {
            hasExpired = true;
          }
        });
        
        // Clear expired products
        const validProducts: Record<string, { product: Product; timestamp: number }> = {};
        Object.entries(state.products).forEach(([key, value]) => {
          if (now - value.timestamp < state.cacheExpiry) {
            validProducts[key] = value;
          } else {
            hasExpired = true;
          }
        });
        
        // Only update if there are expired items
        if (hasExpired) {
          set({
            categoryProducts: validCategoryProducts,
            filteredProducts: validFilteredProducts,
            products: validProducts,
          });
        }
      },
      
      clearAllCache: () => {
        set({
          categories: [],
          categoriesTree: [],
          categoriesTimestamp: null,
          categoryProducts: {},
          filteredProducts: {},
          products: {},
        });
      },
    }),
    {
      name: "app-cache",
      partialize: (state) => ({
        categories: state.categories,
        categoriesTree: state.categoriesTree,
        categoriesTimestamp: state.categoriesTimestamp,
        categoryProducts: state.categoryProducts,
        filteredProducts: state.filteredProducts,
        products: state.products,
      }),
    }
  )
);
