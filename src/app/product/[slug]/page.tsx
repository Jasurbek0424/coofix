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
import { useCart } from "@/store/useCart";
import { useFavorites } from "@/store/useFavorites";
import { useCompare } from "@/store/useCompare";
import type { Product } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "characteristics" | "delivery" | "reviews">("description");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isCompared } = useCompare();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const productData = await getProductBySlug(slug);
        setProduct(productData);

        if (productData) {
          // Fetch similar products (same category)
          const similarResponse = await getProducts({
            category: productData.category.slug,
            limit: 4,
          });
          if (similarResponse.success) {
            setSimilarProducts(
              similarResponse.products.filter((p) => p._id !== productData._id).slice(0, 4)
            );
          }

          // Fetch related products (same brand or category)
          const relatedResponse = await getProducts({
            category: productData.category.slug,
            limit: 8,
          });
          if (relatedResponse.success) {
            setRelatedProducts(
              relatedResponse.products.filter((p) => p._id !== productData._id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Товар не найден");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-coal dark:text-foreground mb-4">
            Товар не найден
          </h1>
          <Link href="/catalog">
            <Button variant="primary">Вернуться в каталог</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productInCart = isInCart(product._id);
  const productLiked = isFavorite(product._id);
  const productCompared = isCompared(product._id);

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: product.category.name, href: `/catalog?category=${product.category.slug}` },
    { label: product.name },
  ];

  const images = product.images && product.images.length > 0 
    ? product.images.filter((img) => {
        return typeof img === "string" && img.trim() !== "";
      })
    : [];
  const currentImage = images[currentImageIndex] || null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-dark rounded-lg overflow-hidden border border-gray-200 dark:border-coal">
              {currentImage && typeof currentImage === "string" && currentImage.trim() !== "" ? (
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
                    {image && typeof image === "string" && image.trim() !== "" ? (
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
              <div className="text-center py-8 text-gray-smoky">
                Отзывов пока нет. Будьте первым!
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground">
                Похожие товары
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {similarProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-coal dark:text-foreground">
                С этим товаром покупают
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
