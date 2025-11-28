"use client";

import Image from "next/image";
import { useState } from "react";
import { IconButton } from "../Icons/IconToggle";
import { FiHeart, FiBarChart2, FiShoppingCart } from "react-icons/fi";
import { IoMdCheckboxOutline } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import Test from "./testRB.png"

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
//   image,
  inStock = true,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [inCart, setInCart] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 w-[300px] cursor-pointer transition-all duration-300 border border-transparent hover:shadow-xl hover:-translate-y-1 hover:border-gray-200">
      <div className="flex justify-end items-center gap-3 mb-3">
        <IconButton variant="chart" icon={FiBarChart2} />
        <IconButton
          variant="like"
          icon={FiHeart}
          activeIcon={FaHeart}
          active={liked}
          onClick={() => setLiked(!liked)}
        />
      </div>
      <div className="flex justify-center mb-4 h-[210px] object-cover">
        <Image
          src={Test}
          alt={title}
          width={220}
          height={180}
          className="object-contain"
        />
      </div>

      <div className="w-full h-px bg-gray-300 my-3" />

      <h3 className="font-medium text-[15px] text-gray-coal leading-tight mb-2">
        {title}
      </h3>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[20px] font-semibold">{price} ₽</p>

          {oldPrice && (
            <p className="text-[14px] line-through text-[#8A8A8A]">
              {oldPrice} ₽
            </p>
          )}

          {inStock ? (
            <p className="text-green-600 flex items-center gap-1 text-sm mt-1">
              ✓ в наличии
            </p>
          ) : (
            <p className="text-red-500 text-sm mt-1">нет в наличии</p>
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
