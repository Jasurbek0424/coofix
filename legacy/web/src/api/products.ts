import { api } from "./axios";
import type { ProductsResponse, Product } from "@/types/product";

export async function getProducts(
  params?: {
    search?: string;
    category?: string;
    sub?: string;
    filter?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    page?: number;
    limit?: number;
  },
  signal?: AbortSignal
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.sub) searchParams.append("sub", params.sub);
  if (params?.filter) searchParams.append("filter", params.filter);
  if (params?.minPrice) searchParams.append("minPrice", params.minPrice.toString());
  if (params?.maxPrice) searchParams.append("maxPrice", params.maxPrice.toString());
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const response = await api.get<ProductsResponse>(
    `/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    { signal }
  );
  return response.data;
}

export async function getNewProducts(limit?: number): Promise<Product[]> {
  try {
    const response = await api.get<ProductsResponse>(
      `/products/new${limit ? `?limit=${limit}` : ""}`
    );
    if (response.data.success && response.data.products) {
      return response.data.products;
    }
    return [];
  } catch (error) {
    console.error("Error fetching new products:", error);
    return [];
  }
}

export async function getSaleProducts(limit?: number): Promise<Product[]> {
  try {
    const response = await api.get<ProductsResponse>(
      `/products/sale${limit ? `?limit=${limit}` : ""}`
    );
    if (response.data.success && response.data.products) {
      return response.data.products;
    }
    return [];
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
}

export async function getHitsProducts(limit?: number): Promise<Product[]> {
  try {
    const response = await api.get<ProductsResponse>(
      `/products/hits${limit ? `?limit=${limit}` : ""}`
    );
    if (response.data.success && response.data.products) {
      return response.data.products;
    }
    return [];
  } catch (error) {
    console.error("Error fetching hits products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<{ success: boolean; product: Product }>(`/products/${id}`);
  return response.data.product;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    // Try Next.js API route first (which handles backend fallback)
    const response = await fetch(`/api/products/${slug}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Product not found");
    }
    const data = await response.json();
    if (!data.success || !data.product) {
      throw new Error("Product not found");
    }
    return data.product;
  } catch (error) {
    // Fallback: Try direct API call with slug endpoint
    try {
      const response = await api.get<{ success: boolean; product: Product }>(`/products/slug/${slug}`);
      return response.data.product;
    } catch (fallbackError) {
      // If slug endpoint doesn't exist, try searching all products by slug
      try {
        const productsResponse = await api.get<ProductsResponse>("/products?limit=1000");
        const product = productsResponse.data.products.find((p) => p.slug === slug);
        if (!product) {
          throw new Error("Product not found");
        }
        return product;
      } catch (searchError) {
        throw new Error("Product not found");
      }
    }
  }
}
