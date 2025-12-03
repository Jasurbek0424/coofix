"use client";
import { Button } from "@/components/ui/Buttons/Button";
import { IconButton } from "@/components/ui/Icons/IconToggle";
import { FiShoppingCart, FiBarChart2 } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import ProductCard from "@/components/ui/Card/ProductCard";
import Footer from "@/components/layout/Footer";

import ThemeToggle from "@/components/ui/ToggleTheme/ThemeToggle";
import Header from "@/components/layout/Header";

import { Modal } from "@/components/ui/Modal";
import { SMSVerificationForm } from "@/components/ui/Forms";
import { useModal } from "@/hooks/useModal";

export default function HomePage() {
  const { isOpen, open, close } = useModal();

  const handleSubmit = async (data: unknown) => {
    // API call
    await console.log(data);
    close();
  };

  return (
    <main className="">
      <Header />
      <div className="container mx-auto">
        <button onClick={open}>Заказать звонок</button>
        <Modal isOpen={isOpen} onClose={close} title="Вход">
          <SMSVerificationForm onSubmit={handleSubmit} />
        </Modal>
        <h1 className="text-3xl dark:text-foreground">Главная</h1>
        <Button variant="primary">ПЕРЕЙТИ К НОВОСТЯМ</Button>
        <Button variant="secondary">ПРОДОЛЖИТЬ ПОКУПКИ</Button>
        <Button variant="gray" disabled>
          СОХРАНИТЬ ИЗМЕНЕНИЯ
        </Button>
        <Button variant="dark">ДАЛЕЕ</Button>
        <IconButton variant="like" icon={FaRegHeart} />
        <IconButton variant="cart" icon={FiShoppingCart} />
        <div className="flex items-center gap-4 mt-2">
          <IconButton variant="chart" icon={FiBarChart2} />
        </div>
        <ThemeToggle />
        <ProductCard
          title="Эмаль Condor ПФ-115 жёлтая 1,8 кг"
          price={500}
          oldPrice={720}
          image="/products/condor.png"
          variant="action"
        />
      </div>

      <Footer />
    </main>
  );
}
