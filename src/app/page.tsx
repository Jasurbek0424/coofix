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
import type { Product } from "@/types/product";

const categories = [
  { name: "Малярные товары", category: "malyarnye-tovary", link: "/catalog?category=malyarnye-tovary" },
  { name: "Электрооборудование", category: "elektrooborudovanie", link: "/catalog?category=elektrooborudovanie" },
  { name: "Спецодежда", category: "specodezhda", link: "/catalog?category=specodezhda" },
  { name: "Для дома и дачи", category: "dlya-doma-i-dachi", link: "/catalog?category=dlya-doma-i-dachi" },
  { name: "Сезонное", category: "sezonnoe", link: "/catalog?category=sezonnoe" },
  { name: "Инструмент", category: "instrument", link: "/catalog?category=instrument" },
];

export default function HomePage() {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // Fetch products for each category
    const fetchCategoryProducts = async () => {
      setLoadingCategories(true);
      const productsMap: Record<string, Product[]> = {};

      try {
        await Promise.all(
          categories.map(async (cat) => {
            try {
              const response = await getProducts({
                category: cat.category,
                limit: 8,
              });
              if (response.success && response.products) {
                productsMap[cat.category] = response.products;
              }
            } catch (error) {
              console.error(`Error fetching products for ${cat.name}:`, error);
              productsMap[cat.category] = [];
            }
          })
        );
        setCategoryProducts(productsMap);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Product Category Sections */}
      {categories.map((category) => (
        <ProductCategorySection
          key={category.category}
          title={category.name}
          products={categoryProducts[category.category] || []}
          categoryLink={category.link}
        />
      ))}

      {/* About Us Section */}
      <AboutSection />

      {/* Products Tabs Section (New/Promotions/Best Sellers) */}
      <ProductsTabs limit={8} />

      {/* News Section */}
      <NewsSection />

      <Footer />
    </main>
  );
}
