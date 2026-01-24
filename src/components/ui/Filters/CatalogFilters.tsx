"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
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

  const hasActiveFilters =
    !!selectedSub ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice");

  const [isMobileOpen, setIsMobileOpen] = useState(hasActiveFilters);
  const justClosedByActionRef = useRef(false);

  useEffect(() => {
    setSelectedSub(searchParams.get("sub"));
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Open panel automatically on mobile if there are active filters (e.g. landing with ?sub=...)
  // Skip if we just closed via subcategory / price filter — otherwise menu reopens immediately
  useEffect(() => {
    if (hasActiveFilters && !justClosedByActionRef.current) {
      setIsMobileOpen(true);
    }
    justClosedByActionRef.current = false;
  }, [hasActiveFilters]);

  const handleSubcategoryClick = (subSlug: string) => {
    justClosedByActionRef.current = true;
    setIsMobileOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    if (selectedSub === subSlug) {
      params.delete("sub");
      setSelectedSub(null);
    } else {
      params.set("sub", subSlug);
      setSelectedSub(subSlug);
    }
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePriceFilter = () => {
    justClosedByActionRef.current = true;
    setIsMobileOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
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
      {/* Mobile header: Category + toggle arrow */}
      <button
        type="button"
        className="flex w-full items-center justify-between mb-2 lg:hidden"
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <span className="text-base font-semibold text-coal dark:text-foreground">
          Категории
        </span>
        <FiChevronDown
          className={`text-smoky transition-transform ${
            isMobileOpen ? "rotate-180" : ""
          }`}
          size={20}
        />
      </button>

      {/* Desktop title */}
      <div className="hidden lg:block mb-4">
        <h3 className="text-lg font-semibold text-coal dark:text-foreground">
          {category.name}
        </h3>
      </div>

      {/* Filters content - smooth collapse on mobile */}
      <div
        className={`space-y-6 mt-2 overflow-hidden lg:overflow-visible transition-all duration-300 ${
          isMobileOpen
            ? "max-h-[800px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        } lg:max-h-none lg:opacity-100 lg:pointer-events-auto lg:block`}
      >
        {/* Category name inside opened panel on mobile */}
        <div className="lg:hidden mb-2">
          <h3 className="text-lg font-semibold text-coal dark:text-foreground">
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
        {(selectedSub ||
          searchParams.get("minPrice") ||
          searchParams.get("maxPrice")) && (
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
