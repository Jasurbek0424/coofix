// src/app/favorites/page.tsx
"use client";

import { useFavorites } from "@/store/useFavorites";
import { useCart } from "@/store/useCart"; // Mahsulotni savatga qo'shish uchun
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiTrash2 } from "react-icons/fi";

// Narx formatlash
const formatPrice = (price: number) => 
  price.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });


export default function FavoriteItems() {
  const { items, toggleFavorite } = useFavorites();
  const { addItem, isInCart } = useCart(); // Savat uchun
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center h-screen">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Избранное пусто</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Добавьте понравившиеся товары, чтобы не потерять их.
        </p>
        <Link href="/catalog" className="bg-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-orange/80 transition-colors">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Избранные товары ({items.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => {
          const productInCart = isInCart(product._id);
          
          return (
            <div key={product._id} className="bg-white dark:bg-dark rounded-xl p-4 shadow-lg border border-gray-200 dark:border-coal flex flex-col">
              {/* Rasmlar va Action tugmalari */}
              <div className="relative h-48 flex justify-center items-center mb-4">
                 <Link href={`/product/${product.slug}`} className="h-full w-full flex justify-center">
                    <Image
                      src={product.images?.[0] || "/placeholder-product.png"}
                      alt={product.name}
                      width={180}
                      height={180}
                      className="object-contain"
                    />
                 </Link>
                 <button 
                    onClick={() => toggleFavorite(product)}
                    className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-2 rounded-full bg-white dark:bg-coal shadow-md"
                    aria-label="Удалить из избранного"
                 >
                    <FiTrash2 size={20} />
                 </button>
              </div>
              
              <Link href={`/product/${product.slug}`} className="flex-1 min-h-[50px]">
                <h3 className="font-medium text-[15px] text-foreground hover:text-orange leading-tight line-clamp-2 mb-2">
                  {product.name}
                </h3>
              </Link>
              
              <div className="mt-auto">
                <p className="text-[20px] font-semibold text-foreground mb-2">
                  {formatPrice(product.price)}
                </p>
                
                <button
                  onClick={() => productInCart ? null : addItem(product, 1)}
                  disabled={!product.inStock || productInCart}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    productInCart
                      ? "bg-green-500 text-white"
                      : product.inStock
                      ? "bg-orange text-white hover:bg-orange/80"
                      : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiShoppingCart size={18} />
                    {productInCart ? "В корзине" : product.inStock ? "В корзину" : "Нет в наличии"}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}