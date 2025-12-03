// src/components/layout/Header/Header.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiHeart,
  FiBarChart2,
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiPhone,
} from "react-icons/fi";
import Logo from "@/assets/logo.png";
import { SocialIcons } from "@/components/ui/Icons/SocialIcons";
import { SearchBar } from "@/components/ui/SearchBar/SearchBar";
import { CatalogDropdown } from "@/components/ui/Dropdown/CatalogDropdown";

import { Modal } from "@/components/ui/Modal";
import { CallbackForm } from "@/components/ui/Forms";
import { useModal } from "@/hooks/useModal";
import ThemeToggle from "../ui/ToggleTheme/ThemeToggle";
import clsx from "clsx";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface MobileFixedNavProps {
  wishlistCount: number;
  compareCount: number;
  cartCount: number;
  openCallbackModal: () => void;
}

const MobileFixedNav = ({
  wishlistCount,
  compareCount,
  cartCount,
  openCallbackModal,
}: MobileFixedNavProps) => {
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === "down";

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-dark border-t border-statDark shadow-2xl transition-transform duration-300",
        isHidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex justify-around items-center h-16 w-full px-2">
        <button
          onClick={openCallbackModal}
          className="flex flex-col items-center justify-center text-sm font-medium text-orange hover:opacity-80 transition-opacity"
          aria-label="Заказать звонок"
        >
          <FiPhone size={22} />
          <span className="text-xs mt-1 hidden xs:block">Звонок</span>
        </button>

        <Link
          href="/favorites"
          className="flex flex-col items-center justify-center text-foreground hover:text-orange transition-colors relative"
          aria-label="Избранное"
        >
          <FiHeart size={22} />
          <span className="text-xs mt-1 hidden xs:block">Избранное</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-3/12 -right-3/12 w-4 h-4 bg-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link
          href="/compare"
          className="flex flex-col items-center justify-center text-foreground hover:text-orange transition-colors relative"
          aria-label="Сравнение"
        >
          <FiBarChart2 size={22} />
          <span className="text-xs mt-1 hidden xs:block">Сравнение</span>
          {compareCount > 0 && (
            <span className="absolute -top-3/12 -right-3/12 w-4 h-4 bg-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {compareCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center justify-center text-foreground hover:text-orange transition-colors"
          aria-label="Профиль"
        >
          <FiUser size={22} />
          <span className="text-xs mt-1 hidden xs:block">Профиль</span>
        </Link>

        <Link
          href="/cart"
          className="flex flex-col items-center justify-center text-foreground hover:text-orange transition-colors relative"
          aria-label="Корзина"
        >
          <FiShoppingCart size={22} />
          <span className="text-xs mt-1 hidden xs:block">Корзина</span>
          {cartCount > 0 && (
            <span className="absolute -top-3/12 -right-3/12 w-4 h-4 bg-orange rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default function Header() {
  const [cartCount] = useState(1);
  const [wishlistCount] = useState(1);
  const [compareCount] = useState(1);
  const [cartTotal] = useState(2000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isOpen, open, close } = useModal();

  const handleSubmit = async (data: unknown) => {
    // API call
    await console.log(data);
    close();
  };

  return (
    <>
      <header className="bg-coal shadow-md shadow-foreground/10 w-full mb-4">
        <div className="border-b border-dark">
          <div className="container mx-auto px-4 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between py-3">
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src={Logo}
                  alt="COOFIX Logo"
                  width={150}
                  height={50}
                  className="h-auto w-[120px] md:w-[150px]"
                  priority
                />
              </Link>

              <div className="hidden lg:flex flex-col items-center gap-2 text-white shrink-0">
                <a
                  href="tel:+74951203214"
                  className="text-sm hover:text-orange transition-colors"
                >
                  +7 495 120-32-14
                </a>
                <Link
                  href="/callback"
                  className="text-sm text-orange underline hover:text-orange/80 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                >
                  Заказать звонок
                </Link>
              </div>

              <div className="text-white hidden xl:block shrink-0">
                <p className="text-sm">Время работы: 10:00-20:00</p>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <ThemeToggle />

                <div className="hidden lg:flex items-center gap-2 md:gap-4">
                  <Link
                    href="/favorites"
                    className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors"
                    aria-label="Избранное"
                  >
                    <FiHeart size={20} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <button
                    className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors"
                    aria-label="Сравнение"
                  >
                    <FiBarChart2 size={20} />
                    {compareCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                        {compareCount}
                      </span>
                    )}
                  </button>

                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors"
                    aria-label="Профиль"
                  >
                    <FiUser size={20} />
                  </Link>

                  <Link
                    href="/cart"
                    className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors lg:w-10" // lg da ham Savat ikonka qoldi
                    aria-label="Корзина"
                  >
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="hidden sm:block ml-2 md:ml-4 text-white">
                  <p className="text-xs">Товаров на сумму</p>
                  <p className="text-sm font-bold">
                    {cartTotal.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <button
                  className="lg:hidden text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:text-orange transition-colors ml-2"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Открыть меню"
                >
                  <FiMenu size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-statDark hidden lg:block">
          <div className="container mx-auto px-4 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between py-3 gap-3">
              <CatalogDropdown />

              <nav className="flex items-center gap-6">
                <Link
                  href="/about"
                  className="text-white hover:text-orange transition-colors font-medium"
                >
                  О компании
                </Link>
                <Link
                  href="/catalog?filter=promo"
                  className="text-white hover:text-orange transition-colors font-medium"
                >
                  Акции
                </Link>
                <Link
                  href="/catalog?filter=hits"
                  className="text-white hover:text-orange transition-colors font-medium"
                >
                  Хиты сезона
                </Link>
                <Link
                  href="/news"
                  className="text-white hover:text-orange transition-colors font-medium"
                >
                  Новинки
                </Link>
              </nav>

              <SearchBar className="flex-1 max-w-sm mr-4" />

              <SocialIcons iconSize={16} />
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "fixed inset-0 z-9999 bg-coal/95 backdrop-blur-sm transition-transform duration-300 transform lg:hidden",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="absolute top-0 right-0 w-full max-w-sm bg-white dark:bg-coal h-full p-6 shadow-2xl overflow-y-auto">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-coal dark:text-white hover:text-red transition-colors"
              aria-label="Закрыть меню"
            >
              <FiX size={30} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-coal dark:text-white mt-10">
              Меню
            </h2>

            <div className="mb-6">
              <SearchBar />
            </div>

            <nav className="flex flex-col space-y-4 border-b pb-6 border-dark/20 dark:border-white/10">
              {[
                { href: "/catalog", label: "Каталог товаров" },
                { href: "/about", label: "О компании" },
                { href: "/catalog?filter=promo", label: "Акции" },
                { href: "/catalog?filter=hits", label: "Хиты сезона" },
                { href: "/news", label: "Новинки" },
                { href: "/profile", label: "Профиль" },
                { href: "/favorites", label: "Избранное" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-coal dark:text-white hover:text-orange transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 space-y-4">
              <p className="font-semibold text-coal dark:text-white">
                Контакты:
              </p>
              <a
                href="tel:+74951203214"
                className="text-lg text-coal dark:text-white hover:text-orange transition-colors block"
              >
                +7 495 120-32-14
              </a>
              <Link
                href="/callback"
                className="text-lg text-orange underline hover:text-orange/80 transition-colors block"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  open();
                }}
              >
                Заказать звонок
              </Link>
            </div>

            <div className="mt-8">
              <SocialIcons
                variant="footer"
                iconSize={24}
                className="justify-start"
              />
            </div>
          </div>
        </div>

        <Modal isOpen={isOpen} onClose={close} title="Заказать звонок">
          <CallbackForm onSubmit={handleSubmit} />
        </Modal>
      </header>

      <MobileFixedNav
        wishlistCount={wishlistCount}
        compareCount={compareCount}
        cartCount={cartCount}
        openCallbackModal={open}
      />
    </>
  );
}
