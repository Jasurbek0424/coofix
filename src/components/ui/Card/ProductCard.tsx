// src/components/ui/Card/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, memo } from "react";

import { FiHeart, FiBarChart2, FiShoppingCart } from "react-icons/fi";
import { IoMdCheckboxOutline } from "react-icons/io";
import { FaHeart } from "react-icons/fa";

import { IconButton } from "../Icons/IconToggle";
import type { Product } from "@/types/product";
import { useCart } from "@/store/useCart";
import { useFavorites } from "@/store/useFavorites";
import { useCompare } from "@/store/useCompare"; // ✨ Qiyoslash store'i

interface ProductCardProps {
  product?: Product;
  variant?: "new" | "action" | "default";
  onClick?: () => void;
  // Legacy props for backward compatibility
  title?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  inStock?: boolean;
}

const ProductCard = memo(function ProductCard({
  product,
  variant,
  onClick,
  // Legacy props
  title: legacyTitle,
  price: legacyPrice,
  oldPrice: legacyOldPrice,
  image: legacyImage,
  inStock: legacyInStock,
}: ProductCardProps) {
  // Zustand stores - Faqat Action'lar olindi
  const { addItem, removeItem } = useCart();
  const { toggleFavorite } = useFavorites();
  const { toggleCompare } = useCompare(); // ✨ Qiyoslash actioni

  // Backward compatibility: if product is not provided, use legacy props
  const isLegacyMode = !product && legacyTitle && legacyPrice !== undefined;

  // Determine variant
  const determinedVariant = variant || 
    (product ? (product.isSale ? "action" : product.isNew ? "new" : "default") : variant || "default");
  
  const productId = product?._id || "";
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get product data (legacy or new API)
  const productImage = isLegacyMode 
    ? legacyImage 
    : (product?.images?.[0] || null);
  
  const title = isLegacyMode ? legacyTitle! : (product?.name || "");
  const price = isLegacyMode ? legacyPrice! : (product?.price || 0);
  const oldPrice = isLegacyMode ? legacyOldPrice : (product?.oldPrice || null);
  const inStock = isLegacyMode ? (legacyInStock ?? true) : (product?.inStock ?? true);
  
  // Only set currentImage if we have a valid image URL
  const [currentImage, setCurrentImage] = useState<string | null>(productImage || null);
  
  // ✨ FIX: Store states (obuna bo'lish - Subscribing)
  // Sevimlilar holati
  const liked = useFavorites(
    (state) => productId ? state.isFavorite(productId) : false
  );
  
  // Savatcha holati
  const inCart = useCart(
    (state) => productId ? state.isInCart(productId) : false
  );
  
  // ✨ FIX: Qiyoslash holati
  const isCompared = useCompare(
    (state) => productId ? state.isCompared(productId) : false
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Update image when product changes
  useEffect(() => {
    const newImage = isLegacyMode 
      ? legacyImage 
      : (product?.images?.[0] || null);
    setCurrentImage(newImage || null);
    setImageError(false);
  }, [product?.images, legacyImage, isLegacyMode]);

  if (!mounted) return null;

  const productSlug = product?.slug || "#";
  const productLink = productSlug !== "#" ? `/product/${productSlug}` : "#";

  return (
    <Link
      href={productLink}
      onClick={onClick}
      className="
        bg-white dark:bg-dark
        rounded-2xl p-4 w-[300px] cursor-pointer
        transition-all duration-300 
        border border-gray-200 dark:border-coal
        shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-orange/30
        block
      "
    >
      {/* Icons */}
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="min-w-[70px] text-center">
          {determinedVariant === "default" && <div />}
          {determinedVariant === "new" && (
            <p className="text-sm font-medium text-foreground bg-background px-2 py-1 rounded">Новинка</p>
          )}
          {determinedVariant === "action" && (
            <p className="text-sm font-medium text-foreground bg-background px-2 py-1 rounded">Акция</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Qiyoslash tugmasi */}
          <IconButton
            variant="chart"
            icon={FiBarChart2}
            activeIcon={FiBarChart2}
            active={isCompared} // ✨ isCompared holati
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (product) {
                toggleCompare(product); // ✨ toggleCompare actioni
              }
            }}
          />

          {/* Sevimlilar tugmasi */}
          <IconButton
            variant="like"
            icon={FiHeart}
            activeIcon={FaHeart}
            active={liked} 
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (product) {
                toggleFavorite(product);
              }
            }}
          />
        </div>
      </div>

      {/* Image */}
      <div className="flex justify-center mb-4 h-[210px] bg-gray-50 dark:bg-coal/50 rounded">
        {imageError || !currentImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-2"
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
              <span className="text-gray-400 text-xs">Изображение отсутствует</span>
            </div>
          </div>
        ) : currentImage && typeof currentImage === "string" ? (
          <Image
            src={currentImage}
            alt={title}
            width={220}
            height={180}
            loading="lazy"
            className="object-contain"
            onError={() => {
              setImageError(true);
            }}
            unoptimized={currentImage.startsWith("http") || currentImage.startsWith("//")}
          />
        ) : null}
      </div>

      <div className="w-full h-px bg-foreground my-3" />

      {/* Title */}
      <h3 className="font-medium text-[15px] text-coal dark:text-foreground leading-tight mb-2">
        {title}
      </h3>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[20px] font-semibold text-black dark:text-foreground">
            {price} ₽
          </p>

          {oldPrice && (
            <p className="text-[14px] line-through text-smoky">{oldPrice} ₽</p>
          )}

          {inStock ? (
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm mt-1">
              ✓ в наличии
            </p>
          ) : (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              нет в наличии
            </p>
          )}
        </div>

        <IconButton
          variant="cart"
          icon={FiShoppingCart}
          activeIcon={IoMdCheckboxOutline}
          active={inCart} 
          onClick={(e) => {
            e?.preventDefault();
            e?.stopPropagation();
            if (product && productId) {
              if (inCart) {
                removeItem(productId);
              } else {
                addItem(product, 1);
              }
            }
          }}
        />
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;