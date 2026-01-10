"use client";

import { useState, useEffect } from "react";
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
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    const filterMap: Record<TabType, string> = {
      new: "new",
      promo: "promo",
      hits: "hits",
    };

    const loadProducts = async () => {
      await fetchProducts({
        filter: filterMap[activeTab],
        limit,
      });
    };

    loadProducts();
  }, [activeTab, limit, fetchProducts]);

  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const tabs = [
    { id: "new" as TabType, label: "Новинки" },
    { id: "promo" as TabType, label: "Акции" },
    { id: "hits" as TabType, label: "Хиты продаж" },
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

