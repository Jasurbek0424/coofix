"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Loader } from "@/components/shared/Loader";
import { Button } from "@/components/ui/Buttons/Button";
import ProductCard from "@/components/ui/Card/ProductCard";
import { IconButton } from "@/components/ui/Icons/IconToggle";
import { FiHeart, FiBarChart2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { getProductBySlug, getProducts } from "@/api/products";
import { getReviews, createOrUpdateReview, deleteReview } from "@/api/reviews";
import { useCart } from "@/store/useCart";
import { useFavorites } from "@/store/useFavorites";
import { useCompare } from "@/store/useCompare";
import { useUser } from "@/store/useUser";
import { ReviewForm, ReviewList } from "@/components/ui/Reviews";
import type { Product } from "@/types/product";
import type { Review } from "@/api/reviews";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "characteristics" | "delivery" | "reviews">("description");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();

  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isCompared } = useCompare();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Optimized: Fetch product and similar products in parallel
        const productPromise = getProductBySlug(slug);
        
        // Start fetching product first
        const productData = await productPromise;
        setProduct(productData);
        setIsLoading(false); // Show product immediately

        if (productData) {
          // Fetch similar products in background (lazy load) - only if category exists
          if (productData.category?.slug) {
            getProducts({
              category: productData.category.slug,
              limit: 10,
            })
              .then((similarResponse) => {
                if (similarResponse.success) {
                  // Filter products to ensure they belong to the same category and exclude current product
                  const filtered = similarResponse.products.filter(
                    (p) => p._id !== productData._id && p.category?.slug === productData.category?.slug
                  );
                  setSimilarProducts(filtered.slice(0, 3));
                }
              })
              .catch((err) => {
                console.error("Error fetching similar products:", err);
                // Don't show error to user, just log it
              });
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Товар не найден");
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Fetch reviews when product is loaded or reviews tab is active
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      
      setIsLoadingReviews(true);
      try {
        const fetchedReviews = await getReviews(product._id);
        setReviews(fetchedReviews);
        
        // Find user's review if authenticated
        if (user?._id) {
          const review = fetchedReviews.find((r) => r.userId === user._id);
          setUserReview(review || null);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    if (product?._id && activeTab === "reviews") {
      fetchReviews();
    }
  }, [product?._id, activeTab, user?._id]);

  const handleReviewSubmitted = async (review: Review) => {
    // Refresh reviews list
    if (product?._id) {
      const fetchedReviews = await getReviews(product._id);
      setReviews(fetchedReviews);
      setUserReview(review);
    }
  };

  const handleReviewDeleted = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    setUserReview(null);
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

  if (error || !product) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-coal dark:text-foreground mb-4">
              Товар не найден
            </h1>
            <Link href="/catalog">
              <Button variant="primary">Вернуться в каталог</Button>
            </Link>
          </div>
        </div>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  const productInCart = isInCart(product._id);
  const productLiked = isFavorite(product._id);
  const productCompared = isCompared(product._id);

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...(product.category ? [{ label: product.category.name, href: `/catalog?category=${product.category.slug}` }] : []),
    { label: product.name },
  ];

  // Extract image URLs from images array (supports both string and object format)
  const getImageUrl = (img: string | { url: string; publicId?: string }): string | null => {
    if (typeof img === "string") {
      return img.trim() || null;
    }
    if (img && typeof img === "object" && "url" in img) {
      return img.url?.trim() || null;
    }
    return null;
  };

  const images = product.images && product.images.length > 0 
    ? product.images
        .map(getImageUrl)
        .filter((url): url is string => url !== null)
    : [];
  const currentImage = images[currentImageIndex] || null;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-dark rounded-lg overflow-hidden border border-gray-200 dark:border-coal">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">Изображение отсутствует</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      currentImageIndex === index
                        ? "border-orange"
                        : "border-gray-200 dark:border-coal"
                    }`}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-coal">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded">
                    Новинка
                  </span>
                )}
                {product.isSale && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                    Акция
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-coal dark:text-foreground mb-4">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-lg text-gray-smoky mb-4">Бренд: {product.brand.name}</p>
              )}
            </div>

            <div>
              <p className="text-2xl md:text-3xl font-bold text-orange mb-2">
                {product.price.toLocaleString("ru-RU")} ₽
              </p>
              {product.oldPrice && (
                <p className="text-lg text-gray-smoky line-through">
                  {product.oldPrice.toLocaleString("ru-RU")} ₽
                </p>
              )}
            </div>

            <div>
              {product.inStock ? (
                <p className="text-green-600 dark:text-green-400 flex items-center gap-2 text-lg">
                  <span>✓</span> В наличии
                </p>
              ) : (
                <p className="text-red-500 dark:text-red-400 text-lg">Нет в наличии</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  if (!productInCart) {
                    addItem(product, 1);
                  }
                }}
                disabled={productInCart || !product.inStock}
                className="flex-1"
              >
                {productInCart ? "В КОРЗИНЕ" : "В КОРЗИНУ"}
              </Button>

              <IconButton
                variant="chart"
                icon={FiBarChart2}
                activeIcon={FiBarChart2}
                active={productCompared}
                onClick={() => toggleCompare(product)}
              />

              <IconButton
                variant="like"
                icon={FiHeart}
                activeIcon={FaHeart}
                active={productLiked}
                onClick={() => toggleFavorite(product)}
              />
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <div className="flex gap-4 border-b border-gray-200 dark:border-coal mb-6">
            {[
              { id: "description", label: "Описание" },
              { id: "characteristics", label: "Характеристики" },
              { id: "delivery", label: "Доставка" },
              { id: "reviews", label: "Отзывы" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-orange"
                    : "text-gray-smoky hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-200 dark:border-coal">
            {activeTab === "description" && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {product.description || "Описание товара отсутствует."}
                </p>
              </div>
            )}

            {activeTab === "characteristics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.characteristics && Object.keys(product.characteristics).length > 0 ? (
                  Object.entries(product.characteristics).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-coal">
                      <span className="font-medium text-foreground">{key}:</span>
                      <span className="text-gray-smoky">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-smoky">Характеристики не указаны</p>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>Доставка осуществляется по всей России.</p>
                <p>Срок доставки: 3-7 рабочих дней.</p>
                <p>При заказе от 5000 ₽ доставка бесплатная.</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Review Form */}
                <ReviewForm
                  productId={product._id}
                  onReviewSubmitted={handleReviewSubmitted}
                  existingReview={userReview}
                />

                {/* Reviews List */}
                {isLoadingReviews ? (
                  <div className="flex justify-center py-8">
                    <Loader size="md" />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
                      Отзывы ({reviews.length})
                    </h3>
                    <ReviewList
                      reviews={reviews}
                      onReviewDeleted={handleReviewDeleted}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products - 3 ta o'xshash product */}
        {similarProducts.length > 0 && (
          <section className="mt-12 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground">
                Похожие товары
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {similarProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
