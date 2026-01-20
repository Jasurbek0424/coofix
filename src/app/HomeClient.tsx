"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  HeroBanner,
} from "@/components/home";
import { getProducts } from "@/api/products";
import { Loader } from "@/components/shared/Loader";
import ProductCard from "@/components/ui/Card/ProductCard";
import type { Product } from "@/types/product";

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
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loadingRandomProducts, setLoadingRandomProducts] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

    fetchRandomProducts();
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />

      <div className="flex-1 flex-grow">
        {/* Hero Banner Section */}
        <HeroBanner />

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
      </div>

      <div className="mt-auto">
      <Footer />
      </div>
    </main>
  );
}
