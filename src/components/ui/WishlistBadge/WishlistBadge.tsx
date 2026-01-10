// src/components/layout/WishlistBadge.tsx (yoki tegishli joy)

"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/store/useFavorites"; // Sizning store'ingiz
import clsx from "clsx";
import { FiHeart } from "react-icons/fi";
import Link from "next/link"; // Headerda ishlatilayotgan Link

// Bu komponent Link elementining o'zi bo'ladi
export function WishlistLink() {
  const [mounted, setMounted] = useState(false);
  // Store'dan count ni olish
  const wishlistCount = useFavorites((state) => state.getCount());

  // Komponent kliyentda yuklanganini tekshirish
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Serverda va Mounted bo'lmaganda
  // Bu holatda, biz badge (son) elementini render qilmaymiz
  // lekin asosiy Link va Heart iconini render qilamiz.
  const displayCount = mounted ? wishlistCount : 0;
  
  return (
    <Link
      href="/favorites"
      className={clsx(
        "relative flex items-center justify-center p-2 hover:bg-coal rounded-full transition-colors",
        !mounted && "pointer-events-none" // Agar mounted bo'lmasa, kliklashni o'chirib qo'yish
      )}
      aria-label="Избранное"
    >
      <FiHeart size={20} />
      
      {/* Faqat mounted bo'lgandan keyin va count > 0 bo'lsa render qilamiz */}
      {displayCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
          {displayCount}
        </span>
      )}
    </Link>
  );
}