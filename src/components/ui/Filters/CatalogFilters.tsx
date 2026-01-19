"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/product";

interface CatalogFiltersProps {
  category: Category | null;
  subcategories: Category[];
}

export default function CatalogFilters({
  category,
  subcategories,
}: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedSub, setSelectedSub] = useState<string | null>(
    searchParams.get("sub")
  );

  useEffect(() => {
    setSelectedSub(searchParams.get("sub"));
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const handleSubcategoryClick = (subSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedSub === subSlug) {
      params.delete("sub");
      setSelectedSub(null);
    } else {
      params.set("sub", subSlug);
      setSelectedSub(subSlug);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }
    
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }
    
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sub");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.set("page", "1");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSub(null);
    router.push(`/catalog?${params.toString()}`);
  };

  if (!category) return null;

  return (
    <div className="w-full lg:w-64 bg-white dark:bg-dark rounded-lg border border-gray-200 dark:border-coal p-4 sm:p-6 mb-4 lg:mb-0 lg:sticky lg:top-4 lg:self-start">
      <div className="space-y-6">
        {/* Category Name */}
        <div>
          <h3 className="text-lg font-semibold text-coal dark:text-foreground mb-4">
            {category.name}
          </h3>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-coal dark:text-foreground mb-3">
              Подкатегории
            </h4>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {subcategories.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => handleSubcategoryClick(sub.slug)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedSub === sub.slug
                      ? "bg-orange text-white font-medium"
                      : "text-gray-smoky hover:bg-gray-100 dark:hover:bg-coal hover:text-orange"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-coal dark:text-foreground mb-3">
            Цена
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="От"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-coal rounded-lg bg-white dark:bg-dark text-coal dark:text-foreground focus:outline-none focus:border-orange"
              />
              <input
                type="number"
                placeholder="До"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-coal rounded-lg bg-white dark:bg-dark text-coal dark:text-foreground focus:outline-none focus:border-orange"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="w-full px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 transition-colors font-medium"
            >
              Применить
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedSub || searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 border border-gray-200 dark:border-coal rounded-lg text-coal dark:text-foreground hover:bg-gray-50 dark:hover:bg-coal transition-colors"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}
