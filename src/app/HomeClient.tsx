"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  HeroBanner,
  ProductCategorySection,
} from "@/components/home";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { Loader } from "@/components/shared/Loader";
import { useCache } from "@/store/useCache";
import ProductCard from "@/components/ui/Card/ProductCard";
import type { Product } from "@/types/product";
import type { Category } from "@/types/product";

// Lazy load non-critical sections
const LazyAboutSection = lazy(() => 
  import("@/components/home/AboutSection").then((mod) => ({ default: mod.default }))
);
const LazyProductsTabs = lazy(() => 
  import("@/components/home/ProductsTabs").then((mod) => ({ default: mod.default }))
);
const LazyNewsSection = lazy(() => 
  import("@/components/home/NewsSection").then((mod) => ({ default: mod.default }))
);

export default function HomeClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRandomProducts, setLoadingRandomProducts] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const cache = useCache();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Optimized: Progressive loading with cache
    const fetchCategoryProducts = async () => {
      setLoadingCategories(true);
      const productsMap: Record<string, Product[]> = {};

      try {
        // Step 1: Check cache first for categories
        let mainCategories = cache.getCategories();
        
        if (!mainCategories) {
          // Fetch categories if not in cache
          mainCategories = await getCategories(null);
          cache.setCategories(mainCategories);
        }
        
        setCategories(mainCategories);
        setLoadingCategories(false); // Show categories immediately

        // Step 2: Load products progressively - check cache first
        const categoriesWithProducts = mainCategories.slice(0, 3); // Only first 3 categories
        
        // Load first category products immediately (critical)
        if (categoriesWithProducts.length > 0) {
          const firstCategory = categoriesWithProducts[0];
          const cachedProducts = cache.getCategoryProducts(firstCategory.slug);
          
          if (cachedProducts) {
            productsMap[firstCategory.slug] = cachedProducts;
            setCategoryProducts({ ...productsMap });
          } else {
            // Fetch first category products
            try {
              const response = await getProducts({
                category: firstCategory.slug,
                limit: 8,
              });

              if (response.success && response.products && response.products.length > 0) {
                const products = response.products.slice(0, 8);
                productsMap[firstCategory.slug] = products;
                cache.setCategoryProducts(firstCategory.slug, products);
                setCategoryProducts({ ...productsMap });
              }
            } catch (error) {
              console.error(`Error fetching products for ${firstCategory.name}:`, error);
            }
          }
        }

        // Step 3: Load remaining categories in background
        if (categoriesWithProducts.length > 1) {
          const remainingCategories = categoriesWithProducts.slice(1);
          
          remainingCategories.forEach(async (category) => {
            try {
              // Check cache first
              const cachedProducts = cache.getCategoryProducts(category.slug);
              
              if (cachedProducts) {
                setCategoryProducts((prev) => ({
                  ...prev,
                  [category.slug]: cachedProducts,
                }));
                return;
              }

              const response = await getProducts({
                category: category.slug,
                limit: 8,
              });

              if (response.success && response.products && response.products.length > 0) {
                const products = response.products.slice(0, 8);
                cache.setCategoryProducts(category.slug, products);
                setCategoryProducts((prev) => ({
                  ...prev,
                  [category.slug]: products,
                }));
              }
            } catch (error) {
              console.error(`Error fetching products for ${category.name}:`, error);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
        setLoadingCategories(false);
      }
    };

    const fetchRandomProducts = async () => {
      setLoadingRandomProducts(true);
      try {
        const response = await getProducts({ limit: 100 }); // Fetch more to get random 10
        if (response.success && response.products && response.products.length > 0) {
          const shuffled = [...response.products].sort(() => Math.random() - 0.5);
          setRandomProducts(shuffled.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching random products:", error);
      } finally {
        setLoadingRandomProducts(false);
      }
    };

    fetchCategoryProducts();
    fetchRandomProducts();
  }, [cache]);

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
            {categories
              .filter((category) => {
                const products = categoryProducts[category.slug] || [];
                return products.length > 0;
              })
              .slice(0, 3)
              .map((category) => {
                const products = categoryProducts[category.slug] || [];
                
                return (
                  <ProductCategorySection
                    key={category._id}
                    title={category.name}
                    products={products}
                    categoryLink={`/catalog?category=${category.slug}`}
                  />
                );
              })}

            {/* Наши товары Section - Random 10 products (6 on mobile) */}
            {loadingRandomProducts ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : randomProducts.length > 0 && (
              <section className="bg-white dark:bg-dark py-8 lg:py-12">
                <div className="container mx-auto px-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground mb-6 md:mb-8 text-center">
                    Наши товары
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                    {(isMobile ? randomProducts.slice(0, 6) : randomProducts).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </section>
            )}

      {/* About Us Section - Load in background */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <LazyAboutSection />
      </Suspense>

      {/* Products Tabs Section (New/Promotions/Best Sellers) - Load in background */}
      <Suspense fallback={<div className="min-h-[400px] bg-coal" />}>
        <LazyProductsTabs limit={8} />
      </Suspense>

      {/* News Section - Load in background */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <LazyNewsSection />
      </Suspense>
          </>
        )}
      </div>

      <div className="mt-auto">
      <Footer />
      </div>
    </main>
  );
}
