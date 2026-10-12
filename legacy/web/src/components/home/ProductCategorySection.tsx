"use client";

import { useState, useEffect, memo, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/Card/ProductCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Product } from "@/types/product";

interface ProductCategorySectionProps {
  title: string;
  products: Product[];
  categoryLink?: string;
}

const ProductCategorySection = memo(function ProductCategorySection({
  title,
  products,
  categoryLink,
}: ProductCategorySectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  
  useEffect(() => {
    const updateVisibleCards = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) {
          setVisibleCards(4);
        } else if (window.innerWidth >= 768) {
          setVisibleCards(3);
        } else {
          setVisibleCards(2);
        }
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const cardWidth = 280; // Approximate width of a product card including gap
  const gap = 16;

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`category-${title}`);
    if (!container) return;

    const scrollAmount = (cardWidth + gap) * (direction === "right" ? visibleCards : -visibleCards);
    const newPosition = scrollPosition + scrollAmount;
    const maxScroll = container.scrollWidth - container.clientWidth;

    const finalPosition = Math.max(0, Math.min(newPosition, maxScroll));
    container.scrollTo({ left: finalPosition, behavior: "smooth" });
    setScrollPosition(finalPosition);
  };

  // Optimized: Memoize products list to avoid unnecessary re-renders
  const memoizedProducts = useMemo(() => products, [products]);

  if (memoizedProducts.length === 0) return null;

  return (
    <section className="bg-white dark:bg-dark py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground">
            {title}
          </h2>
          {categoryLink && (
            <Link
              href={categoryLink}
              className="text-orange hover:text-orange/80 font-medium transition-colors"
            >
              Смотреть все →
            </Link>
          )}
        </div>

        <div className="relative">
          {/* Products Container */}
          <div
            id={`category-${title}`}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            {memoizedProducts.map((product) => (
              <div key={product._id} className="min-w-[260px] md:min-w-[280px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {memoizedProducts.length > visibleCards && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-10 hidden lg:flex"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="w-6 h-6 text-coal dark:text-foreground" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all z-10 hidden lg:flex"
                aria-label="Scroll right"
              >
                <FiChevronRight className="w-6 h-6 text-coal dark:text-foreground" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
});

ProductCategorySection.displayName = "ProductCategorySection";

export default ProductCategorySection;

