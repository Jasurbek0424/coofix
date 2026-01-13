"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ui/Card/ProductCard";
import { useProducts } from "@/store/useProducts";
import { Loader } from "@/components/shared/Loader";
import type { Product } from "@/types/product";

type TabType = "new" | "promo" | "hits";

interface ProductsTabsProps {
  limit?: number;
}

export default function ProductsTabs({ limit = 8 }: ProductsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const { products, isLoading, fetchProducts } = useProducts();

  useEffect(() => {
    const filterMap: Record<TabType, string> = {
      new: "new",
      promo: "sale",
      hits: "hits",
    };

    const loadProducts = async () => {
      await fetchProducts({
        filter: filterMap[activeTab],
        limit: limit * 2, // Fetch more to filter client-side
      });
    };

    loadProducts();
  }, [activeTab, limit, fetchProducts]);

  // Optimized: Use useMemo to avoid unnecessary recalculations
  const localProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Filter products client-side to ensure they match the tab criteria
    let filtered: Product[] = [];
    
    switch (activeTab) {
      case "new":
        // Новинки - products with isNew: true
        filtered = products.filter((p) => p.isNew === true);
        break;
      case "promo":
        // Акции - products with isSale: true
        filtered = products.filter((p) => p.isSale === true);
        break;
      case "hits":
        // Хиты сезона - products with high rating or hits filter
        filtered = products.filter((p) => p.ratingAvg >= 4 || p.ratingCount > 10);
        break;
      default:
        filtered = products;
    }
    
    // Limit to the requested number
    return filtered.slice(0, limit);
  }, [products, activeTab, limit]);

  const tabs = [
    { id: "new" as TabType, label: "Новинки" },
    { id: "promo" as TabType, label: "Акции" },
    { id: "hits" as TabType, label: "Хиты сезона" },
  ];

  return (
    <section className="bg-coal py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 md:px-8 py-4 text-lg font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-orange"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange" />
              )}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : localProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {localProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/70">
            Товары не найдены
          </div>
        )}
      </div>
    </section>
  );
}

