"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/ui/Card/ProductCard";
import { getNewProducts, getSaleProducts, getHitsProducts } from "@/api/products";
import { Loader } from "@/components/shared/Loader";
import type { Product } from "@/types/product";

type TabType = "new" | "promo" | "hits";

interface ProductsTabsProps {
  limit?: number;
}

export default function ProductsTabs({ limit = 8 }: ProductsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let fetchedProducts: Product[] = [];
        
        switch (activeTab) {
          case "new":
            fetchedProducts = await getNewProducts(limit * 2); // Fetch more for random selection
            break;
          case "promo":
            fetchedProducts = await getSaleProducts(limit * 2);
            break;
          case "hits":
            fetchedProducts = await getHitsProducts(limit * 2);
            break;
        }
        
        // Shuffle products randomly
        const shuffled = [...fetchedProducts].sort(() => Math.random() - 0.5);
        setProducts(shuffled.slice(0, limit));
      } catch (error) {
        console.error(`Error fetching products for ${activeTab}:`, error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [activeTab, limit]);

  const localProducts = useMemo(() => {
    return products.slice(0, limit);
  }, [products, limit]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
