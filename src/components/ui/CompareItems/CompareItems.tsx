// src/app/compare/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FiTrash2 } from "react-icons/fi";
import type { Product } from "@/types/product"; 

// ✨ FIX: React.ReactNode tipidan foydalanish uchun React import qilindi
import React, { ReactNode } from "react"; 
import { useCompare } from "@/store/useCompare";

// FIX 2: formatPrice endi 'unknown' turini qabul qiladi va ichida 'number'ga tekshiradi
const formatPrice = (value: unknown): string => {
  const price = typeof value === 'number' ? value : 0;
  return price.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
};

const compareFeatures: { 
  key: keyof Product | 'price' | 'inStock' | 'manufacturer';
  label: string; 
  format?: (value: unknown) => string | ReactNode
}[] = [
    { key: 'price', label: 'Цена', format: formatPrice },
    { 
        key: 'inStock', 
        label: 'Наличие', 
        // FIX 2: Inline format funksiyasi endi 'unknown' turini qabul qiladi
        format: (value: unknown) => {
            const val = !!value; // True/False ga aylantirish
            return val 
                ? <span className="text-green-500 font-medium">✓ В наличии</span> 
                : <span className="text-red-500 font-medium">✗ Нет в наличии</span>
        }
    },
    { key: 'manufacturer', label: 'Производитель' },
    // Boshqa xususiyatlarni qo'shishingiz mumkin
    // { key: 'power', label: 'Мощность' }, 
    // { key: 'weight', label: 'Вес' },
];

export default function CompareItems() {
  const { items, toggleCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center h-screen">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Сравнение пусто</h1>
        <p className="text-lg text-smoky mb-8">
          Добавьте товары для сравнения, чтобы увидеть их различия.
        </p>
        <Link href="/catalog" className="bg-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-orange/80 transition-colors">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Сравнение товаров ({items.length})</h1>
      
      <div className="overflow-x-auto bg-white dark:bg-dark rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-statDark">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white dark:bg-dark p-4 w-[200px] text-left text-sm font-semibold text-smoky uppercase z-10">
                Характеристика
              </th>
              {items.map((product) => (
                <th key={product._id} className="p-4 w-[250px] text-center bg-gray-50 dark:bg-coal/50">
                  <div className="flex flex-col items-center">
                    <button 
                        onClick={() => toggleCompare(product)}
                        className="text-black hover:text-red-500 transition-colors mb-2 self-end"
                        aria-label="Удалить из сравнения"
                    >
                        <FiTrash2 size={20} />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <Image
                        src={typeof product.images?.[0] === 'string' ? product.images[0] : "/placeholder-product.png"}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="object-contain mb-2"
                      />
                      <p className="text-sm font-medium text-foreground hover:text-orange line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-coal text-sm">
            {compareFeatures.map((feature) => (
              <tr key={feature.key.toString()}>
                {/* Xususiyat nomi */}
                <td className="sticky left-0 bg-white dark:bg-dark p-4 font-medium text-foreground whitespace-nowrap z-10">
                  {feature.label}
                </td>
                
                {/* Mahsulot qiymatlari */}
                {items.map((product) => {
                    // product[feature.key] qiymatini olishda xavfsizroq yondashuv
                    let value: unknown;
                    if (feature.key === 'price') {
                        value = product.price;
                    } else if (feature.key === 'inStock') {
                        value = product.inStock;
                    } else {
                        // Agar Product interfeysida bo'lmasa, undefined qaytadi
                        value = product[feature.key as keyof Product] as unknown; 
                    }
                    
                    return (
                        <td key={`${product._id}-${feature.key.toString()}`} className="p-4 text-center text-smoky">
                            {/* Agar format funksiyasi mavjud bo'lsa, uni ishlatish, aks holda toString() */}
                            {feature.format ? feature.format(value) : (value?.toString() || '-')}
                        </td>
                    );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={() => {
            // Ro'yxatni tozalash uchun barcha elementlarni birma-bir o'chirish
            items.forEach(product => toggleCompare(product));
          }}
          className="text-red-500 hover:text-red-700 transition-colors text-sm"
        >
          Очистить список сравнения
        </button>
      </div>
    </div>
  );
}