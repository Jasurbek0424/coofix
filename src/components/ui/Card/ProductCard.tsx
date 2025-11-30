"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { FiHeart, FiBarChart2, FiShoppingCart } from "react-icons/fi";
import { IoMdCheckboxOutline } from "react-icons/io";
import { FaHeart } from "react-icons/fa";

import { IconButton } from "../Icons/IconToggle";
import Test from "./testRB.png";

interface ProductCardProps {
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock?: boolean;
}

export default function ProductCard({
  title,
  price,
  oldPrice,
  inStock = true,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [addedChart, setAddedChart] = useState(false);
  const [inCart, setInCart] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className="
        bg-white dark:bg-dark
        rounded-xl p-4 w-[300px] cursor-pointer
        transition-all duration-300 
        border border-transparent 
        hover:shadow-xl hover:-translate-y-1 hover:border-gray shadow-sm
      "
    >
      {/* Icons */}
      <div className="flex justify-end items-center gap-3 mb-3">
        <IconButton
          variant="chart"
          icon={FiBarChart2}
          activeIcon={FiBarChart2}
          active={addedChart}
          onClick={() => setAddedChart(!addedChart)}
        />

        <IconButton
          variant="like"
          icon={FiHeart}
          activeIcon={FaHeart}
          active={liked}
          onClick={() => setLiked(!liked)}
        />
      </div>

      {/* Image */}
      <div className="flex justify-center mb-4 h-[210px]">
        <Image
          src={Test}
          alt={title}
          width={220}
          height={180}
          className="object-contain"
        />
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
            <p className="text-[14px] line-through text-smoky">
              {oldPrice} ₽
            </p>
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
          onClick={() => setInCart(!inCart)}
        />
      </div>
    </div>
  );
}
