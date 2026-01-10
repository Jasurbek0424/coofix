"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCategories } from "@/api/categories";
import { getProducts } from "@/api/products";
import ProductCard from "@/components/ui/Card/ProductCard";
import type { Category, Product } from "@/types/product";

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subParam = searchParams.get("sub");
  const filterParam = searchParams.get("filter");
  const searchParam = searchParams.get("search");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Category[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch main categories (parent is null)
        const mainCategories = await getCategories(null);
        setCategories(mainCategories);

        // Fetch subcategories for each main category
        const subcategoriesPromises = mainCategories.map(async (category) => {
          const subs = await getCategories(category._id);
          return { categoryId: category._id, subcategories: subs };
        });

        const subcategoriesResults = await Promise.all(subcategoriesPromises);
        const subcategoriesMap: Record<string, Category[]> = {};
        
        subcategoriesResults.forEach(({ categoryId, subcategories }) => {
          subcategoriesMap[categoryId] = subcategories;
        });

        setSubcategoriesMap(subcategoriesMap);

        // If category or filter params exist, fetch products
        if (categoryParam || filterParam || searchParam) {
          const category = mainCategories.find(c => c.slug === categoryParam);
          if (categoryParam && category) {
            setSelectedCategory(category);
          }

          const response = await getProducts({
            category: categoryParam || undefined,
            sub: subParam || undefined,
            filter: filterParam || undefined,
            search: searchParam || undefined,
            page: currentPage,
            limit: 12,
          });

          if (response.success && response.products) {
            setProducts(response.products);
            setTotalPages(Math.ceil(response.total / 12));
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Ошибка при загрузке данных");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryParam, subParam, filterParam, searchParam, currentPage]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine page title based on filters
  const getPageTitle = () => {
    if (filterParam === "promo") return "Акции";
    if (filterParam === "hits") return "Хиты сезона";
    if (filterParam === "new") return "Новинки";
    if (selectedCategory) return selectedCategory.name;
    if (searchParam) return `Результаты поиска: ${searchParam}`;
    return "Каталог";
  };

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    ...(selectedCategory
      ? [
          { label: "Каталог", href: "/catalog" },
          { label: selectedCategory.name },
        ]
      : [{ label: "Каталог" }]),
  ];

  // Show products if there are filter params
  const showProducts = categoryParam || filterParam || searchParam;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-8">
          {getPageTitle()}
        </h1>

        {showProducts ? (
          // Products view
          <>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-dark border border-gray-200 dark:border-coal rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-coal transition-colors"
                    >
                      Назад
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-orange text-white"
                            : "bg-white dark:bg-dark border border-gray-200 dark:border-coal hover:bg-gray-50 dark:hover:bg-coal"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white dark:bg-dark border border-gray-200 dark:border-coal rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-coal transition-colors"
                    >
                      Вперед
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Товары не найдены"
                message={
                  filterParam === "promo"
                    ? "В данный момент акционных товаров нет. Проверьте позже."
                    : filterParam === "hits"
                    ? "Хиты сезона скоро появятся. Следите за обновлениями."
                    : filterParam === "new"
                    ? "Новых товаров пока нет. Следите за обновлениями."
                    : searchParam
                    ? `По запросу "${searchParam}" ничего не найдено. Попробуйте изменить поисковый запрос.`
                    : "В данной категории товары отсутствуют."
                }
              />
            )}
          </>
        ) : (
          // Categories view
          categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-smoky text-lg">Категории не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const subcategories = subcategoriesMap[category._id] || [];
                const isExpanded = expandedCategory === category._id;

                return (
                  <div
                    key={category._id}
                    className="bg-white dark:bg-dark rounded-lg shadow-md border border-gray-200 dark:border-coal overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link
                      href={`/catalog?category=${category.slug}`}
                      className="block"
                    >
                      {category.image && (
                        <div className="relative h-48 w-full bg-gray-100 dark:bg-coal">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-coal dark:text-foreground mb-2 hover:text-orange transition-colors">
                          {category.name}
                        </h2>
                        {subcategories.length > 0 && (
                          <p className="text-sm text-gray-smoky">
                            {subcategories.length} подкатегорий
                          </p>
                        )}
                      </div>
                    </Link>

                    {subcategories.length > 0 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCategory(category._id);
                          }}
                          className="w-full px-6 pb-4 text-sm text-orange hover:text-orange/80 font-medium transition-colors"
                        >
                          {isExpanded ? "Скрыть подкатегории" : "Показать подкатегории"}
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6 space-y-2 border-t border-gray-200 dark:border-coal pt-4">
                            {subcategories.map((subcategory) => (
                              <Link
                                key={subcategory._id}
                                href={`/catalog?category=${category.slug}&sub=${subcategory.slug}`}
                                className="block py-2 px-3 rounded text-sm text-gray-smoky hover:text-orange hover:bg-gray-50 dark:hover:bg-coal transition-colors"
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
