"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  HeroBanner,
  ProductCategorySection,
  AboutSection,
  ProductsTabs,
  NewsSection,
} from "@/components/home";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { Loader } from "@/components/shared/Loader";
import type { Product } from "@/types/product";
import type { Category } from "@/types/product";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // Optimized: Progressive loading - first categories, then products
    const fetchCategoryProducts = async () => {
      setLoadingCategories(true);
      const productsMap: Record<string, Product[]> = {};

      try {
        // Step 1: Fetch categories first (fast)
        const mainCategories = await getCategories(null);
        setCategories(mainCategories);
        setLoadingCategories(false); // Show categories immediately

        // Step 2: Fetch products in parallel for all categories (optimized)
        // Use Promise.allSettled to handle errors gracefully
        const productPromises = mainCategories.map(async (category) => {
          try {
            const response = await getProducts({
              category: category.slug,
              limit: 8,
            });
            if (response.success && response.products && response.products.length > 0) {
              // Filter products to ensure they belong to this category
              const filteredProducts = response.products.filter(
                (product) => product.category?.slug === category.slug
              );
              if (filteredProducts.length > 0) {
                return { slug: category.slug, products: filteredProducts };
              }
            }
            return null;
          } catch (error) {
            console.error(`Error fetching products for ${category.name}:`, error);
            return null;
          }
        });

        // Wait for all product requests to complete
        const results = await Promise.allSettled(productPromises);
        
        // Update products map as they load
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            productsMap[result.value.slug] = result.value.products;
            // Update state incrementally for better UX
            setCategoryProducts((prev) => ({
              ...prev,
              [result.value!.slug]: result.value!.products,
            }));
          }
        });
      } catch (error) {
        console.error("Error fetching category products:", error);
        setLoadingCategories(false);
      }
    };

    fetchCategoryProducts();
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <div className="flex-1 flex-grow">
        {/* Hero Banner Section */}
        <HeroBanner />

        {/* Product Category Sections - Only show categories that have products */}
        {loadingCategories ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {categories.map((category) => {
              const products = categoryProducts[category.slug] || [];
              if (products.length === 0) return null;
              
              return (
                <ProductCategorySection
                  key={category._id}
                  title={category.name}
                  products={products}
                  categoryLink={`/catalog?category=${category.slug}`}
                />
              );
            })}

            {/* About Us Section */}
            <AboutSection />

            {/* Products Tabs Section (New/Promotions/Best Sellers) */}
            <ProductsTabs limit={8} />

            {/* News Section */}
            <NewsSection />
          </>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
}
