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
import { getCategoriesTree } from "@/api/categories";
import { getProducts } from "@/api/products";
import ProductCard from "@/components/ui/Card/ProductCard";
import CatalogFilters from "@/components/ui/Filters/CatalogFilters";
import { useCache } from "@/store/useCache";
import type { Category, Product } from "@/types/product";

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subParam = searchParams.get("sub");
  const filterParam = searchParams.get("filter");
  const searchParam = searchParams.get("search");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Category[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const cache = useCache();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first for categories tree
        let categoriesTree = cache.getCategoriesTree();
        
        if (!categoriesTree) {
          // Fetch categories tree from API if not in cache
          categoriesTree = await getCategoriesTree();
          cache.setCategoriesTree(categoriesTree);
        }
        
        setCategories(categoriesTree);

        // Build subcategories map from tree structure
        const subcategoriesMap: Record<string, Category[]> = {};
        categoriesTree.forEach((category) => {
          if (category.children && category.children.length > 0) {
            subcategoriesMap[category._id] = category.children;
          }
        });

        setSubcategoriesMap(subcategoriesMap);

        // If category or filter params exist, fetch products
        if (categoryParam || filterParam || searchParam) {
          const category = categoriesTree.find(c => c.slug === categoryParam);
          let selectedSubcategory: Category | null = null;
          
          if (categoryParam && category) {
            setSelectedCategory(category);
            
            // Find subcategory if subParam exists
            if (subParam && category.children) {
              selectedSubcategory = category.children.find(
                (sub) => sub.slug === subParam
              ) || null;
            }
          }

          // Create cache key for filtered products
          const cacheKey = JSON.stringify({
            category: categoryParam,
            sub: subParam,
            filter: filterParam,
            search: searchParam,
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            page: currentPage,
          });
          
          // Check cache first
          const cachedData = cache.getFilteredProducts(cacheKey);
          
          if (cachedData) {
            setProducts(cachedData.products);
            setTotalPages(Math.ceil(cachedData.total / 12));
            setIsLoading(false);
            return;
          }

          // If filtering by category, fetch ALL products from all pages
          // Backend returns paginated results, so we need to fetch all pages
          const shouldGetAllProducts = categoryParam || subParam;
          
          let allProducts: Product[] = [];
          let totalProducts = 0;
          
          if (shouldGetAllProducts) {
            // Fetch all products by making multiple requests
            // Strategy:
            // - If only categoryParam: fetch all products from parent category (backend returns parent + children)
            // - If subParam exists: fetch with sub param, but we'll also filter on client side for accuracy
            let currentPageNum = 1;
            const perPage = 100;
            let hasMore = true;
            
            while (hasMore) {
              const response = await getProducts({
                category: categoryParam || undefined,
                sub: subParam || undefined,
                filter: filterParam || undefined,
                search: searchParam || undefined,
                minPrice: minPriceParam || undefined,
                maxPrice: maxPriceParam || undefined,
                page: currentPageNum,
                limit: perPage,
              });
              
              if (response.success && response.products) {
                allProducts = [...allProducts, ...response.products];
                totalProducts = response.total;
                
                // Check if there are more products to fetch
                if (response.products.length < perPage || allProducts.length >= response.total) {
                  hasMore = false;
                } else {
                  currentPageNum++;
                }
              } else {
                hasMore = false;
              }
            }
            
          } else {
            // Normal pagination for non-category filters
            const response = await getProducts({
              category: categoryParam || undefined,
              sub: subParam || undefined,
              filter: filterParam || undefined,
              search: searchParam || undefined,
              minPrice: minPriceParam || undefined,
              maxPrice: maxPriceParam || undefined,
              page: currentPage,
              limit: 12,
            });
            
            if (response.success && response.products) {
              allProducts = response.products;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              totalProducts = response.total;
            }
          }
          
          if (allProducts.length > 0) {
            let filteredProducts = allProducts;
            
            // First, filter by category/subcategory
            if (categoryParam && category) {
              if (subParam && selectedSubcategory) {
                filteredProducts = allProducts.filter(
                  (product) => {
                    if (!product.category) return false;
                    const matchesId = product.category._id === selectedSubcategory._id;
                    const matchesSlug = product.category.slug === selectedSubcategory.slug;
                    const matchesParent = product.category.parent === selectedSubcategory._id;
                    return matchesId || matchesSlug || matchesParent;
                  }
                );
              } else {
                const validCategoryIds: string[] = [category._id];
                const validCategorySlugs: string[] = [category.slug];
                
                if (category.children && category.children.length > 0) {
                  category.children.forEach((child) => {
                    validCategoryIds.push(child._id);
                    validCategorySlugs.push(child.slug);
                  });
                }
                
                filteredProducts = allProducts.filter(
                  (product) => {
                    if (!product.category) return false;
                    const matchesId = validCategoryIds.includes(product.category._id);
                    const matchesSlug = validCategorySlugs.includes(product.category.slug);
                    const matchesParent = product.category.parent === category._id;
                    return matchesId || matchesSlug || matchesParent;
                  }
                );
              }
            }
            
            // Then, apply price filter on client side (for category-filtered products)
            if (minPriceParam || maxPriceParam) {
              const minPrice = minPriceParam ? parseFloat(minPriceParam) : 0;
              const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : Infinity;
              
              filteredProducts = filteredProducts.filter(
                (product) => {
                  const productPrice = product.price || 0;
                  return productPrice >= minPrice && productPrice <= maxPrice;
                }
              );
            }
            
           
            
            // Apply client-side pagination for category-filtered products
            let paginatedProducts = filteredProducts;
            const totalCount = filteredProducts.length;
            
            if (categoryParam || subParam) {
              // Client-side pagination for category-filtered products
              const itemsPerPage = 12;
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              paginatedProducts = filteredProducts.slice(startIndex, endIndex);
              setTotalPages(Math.ceil(totalCount / itemsPerPage));
            } else {
              // Use API pagination for non-category filters
              // totalCount is already set from totalProducts above
              setTotalPages(Math.ceil(totalCount / 12));
            }
            
            setProducts(paginatedProducts);
            
            // Cache the results (cache all filtered products, not paginated)
            cache.setFilteredProducts(cacheKey, filteredProducts, totalCount);
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
  }, [categoryParam, subParam, filterParam, searchParam, minPriceParam, maxPriceParam, currentPage, cache]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
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

  const getPageTitle = () => {
    if (filterParam === "promo" || filterParam === "sale") return "Акции";
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
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-coal dark:text-foreground mb-6 md:mb-8">
          {getPageTitle()}
        </h1>

        {showProducts ? (
          // Products view with filters
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Filter Sidebar - Show on mobile first, then desktop left */}
            {categoryParam && selectedCategory && (
              <div className="w-full lg:w-64 lg:shrink-0 order-1 lg:order-1">
                <CatalogFilters
                  category={selectedCategory}
                  subcategories={subcategoriesMap[selectedCategory._id] || []}
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 order-2 lg:order-2">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 md:mt-8 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-white dark:bg-dark border border-gray-200 dark:border-coal rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-coal transition-colors"
                    >
                      Назад
                    </button>
                    <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-orange text-white"
                              : "bg-white dark:bg-dark border border-gray-200 dark:border-coal hover:bg-gray-50 dark:hover:bg-coal"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-white dark:bg-dark border border-gray-200 dark:border-coal rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-coal transition-colors"
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
                    : filterParam === "sale"
                    ? "Товары со скидкой скоро появятся. Следите за обновлениями."
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
            </div>
          </div>
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
                      {(() => {
                        // Handle different image formats: string | null | { url: string; publicId: string }
                        let imageUrl: string | null = null;
                        
                        if (category.image) {
                          if (typeof category.image === "string") {
                            imageUrl = category.image.trim() || null;
                          } else if (typeof category.image === "object" && "url" in category.image) {
                            imageUrl = category.image.url?.trim() || null;
                          }
                        }

                        return imageUrl ? (
                          <div className="relative h-48 w-full bg-gray-100 dark:bg-coal">
                            <Image
                              src={imageUrl}
                              alt={category.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="relative h-48 w-full bg-gray-100 dark:bg-coal flex items-center justify-center">
                            <div className="text-center text-gray-400 dark:text-gray-600">
                              <svg
                                className="w-16 h-16 mx-auto mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-xs">Изображение отсутствует</span>
                            </div>
                          </div>
                        );
                      })()}
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

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
