"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  HeroBanner,
  FeaturesSection,
  SocialMediaSection,
} from "@/components/home";
import { getProducts } from "@/api/products";
import { Loader } from "@/components/shared/Loader";
import ProductCard from "@/components/ui/Card/ProductCard";
import type { Product } from "@/types/product";
import Image from "next/image";
import S2Bg from "@/assets/s2.jpg";

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

      <div className="flex-1 grow">
        {/* Hero Banner Section */}
        <HeroBanner />

        {/* Features Section - 5 feature cards */}
        <FeaturesSection />

        {/* Наши товары Section - Random 10 products (6 on mobile) */}
        {loadingRandomProducts ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : randomProducts.length > 0 && (
          <section className="relative bg-gray-50 dark:bg-coal py-8 lg:py-12 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={S2Bg}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-20 dark:opacity-15"
                priority={false}
              />
              {/* Dark overlay for better readability */}
              <div className="absolute inset-0 bg-gray-50/80 dark:bg-coal/80"></div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 z-0">
              <div className="absolute top-0 left-0 w-full h-full">
                {/* Diagonal Lines */}
                <div className="absolute top-10 left-0 w-40 h-px bg-orange transform rotate-12"></div>
                <div className="absolute top-20 right-10 w-32 h-px bg-orange transform -rotate-12"></div>
                <div className="absolute top-1/3 left-1/4 w-24 h-px bg-orange transform rotate-45"></div>
                <div className="absolute top-1/2 right-1/4 w-28 h-px bg-orange transform -rotate-45"></div>
                <div className="absolute bottom-20 left-10 w-48 h-px bg-orange transform rotate-12"></div>
                <div className="absolute bottom-10 right-0 w-36 h-px bg-orange transform -rotate-12"></div>
                
                {/* Vertical Lines */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-orange opacity-30"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-orange opacity-30"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-orange opacity-20"></div>
                <div className="absolute top-0 right-1/2 w-px h-full bg-orange opacity-20"></div>
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-orange/5 via-transparent to-orange/5 dark:from-orange/10 dark:via-transparent dark:to-orange/10 z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
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

        {/* Social Media Section - Мы в соц сетях */}
        <SocialMediaSection />
      </div>

      <div className="mt-auto">
      <Footer />
      </div>
    </main>
  );
}
