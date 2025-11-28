"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Buttons/Button";
import { IconButton } from "@/components/ui/Icons/IconToggle";
import { FiShoppingCart, FiBarChart2 } from "react-icons/fi";
import { IoMdCheckboxOutline } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import ProductCard from "@/components/ui/Card/ProductCard";
import { Loader } from "@/components/shared/Loader";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const [inCart, setInCart] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <main className="p-4">
      <h1 className="text-3xl bg-background text-orange">Главная</h1>
      <Button variant="primary">ПЕРЕЙТИ К НОВОСТЯМ</Button>
      <Button variant="secondary">ПРОДОЛЖИТЬ ПОКУПКИ</Button>
      <Button variant="gray" disabled>
        СОХРАНИТЬ ИЗМЕНЕНИЯ
      </Button>
      <Button variant="dark">ДАЛЕЕ</Button>
      <IconButton
        variant="like"
        icon={FaRegHeart}
        activeIcon={FaHeart}
        active={liked}
        onClick={() => setLiked(!liked)}
      />
      <IconButton
        variant="cart"
        icon={FiShoppingCart}
        activeIcon={IoMdCheckboxOutline}
        active={inCart}
        onClick={() => setInCart(!inCart)}
      />
      <div className="flex items-center gap-4 mt-2">
        <IconButton variant="chart" icon={FiBarChart2} />
      </div>
      <ProductCard
        title="Эмаль Condor ПФ-115 жёлтая 1,8 кг"
        price={500}
        oldPrice={720}
        image="/products/condor.png"
      />
      <Loader size="lg" fullScreen/>


      <Footer />
    </main>
  );
}
