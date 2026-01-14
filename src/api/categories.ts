import { api } from "./axios";
import type { Category } from "@/types/product";

export interface CategoriesResponse {
  success: boolean;
  categories?: Category[];
  message?: string;
}

// GET /categories - Get all categories (optionally filtered by parent)
export async function getCategories(parent?: string | null): Promise<Category[]> {
  try {
    const params = parent ? { parent } : {};
    const searchParams = new URLSearchParams();
    if (parent) {
      searchParams.append("parent", parent);
    }

    const response = await api.get<CategoriesResponse>(
      `/categories${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    );

    if (response.data.success && Array.isArray(response.data.categories)) {
      return response.data.categories;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await api.get<{ success: boolean; category?: Category }>(
      `/categories/slug/${slug}`
    );
    if (response.data.success && response.data.category) {
      return response.data.category;
    }
    return null;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

// GET /categories/tree - Get categories tree structure
export interface CategoriesTreeResponse {
  success: boolean;
  tree?: Category[];
  message?: string;
}

export async function getCategoriesTree(): Promise<Category[]> {
  try {
    const response = await api.get<CategoriesTreeResponse>("/categories/tree");
    if (response.data.success && Array.isArray(response.data.tree)) {
      return response.data.tree;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories tree:", error);
    return [];
  }
}
