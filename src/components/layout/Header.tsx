// src/components/layout/Header/Header.tsx
"use client";

import { useState, useEffect } from "react";
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
import { SuccessModal } from "@/components/ui/Modal";
import { CallbackForm } from "@/components/ui/Forms";
import { useModal } from "@/hooks/useModal";
import type { CallbackFormData } from "@/lib/validations";
import ThemeToggle from "../ui/ToggleTheme/ThemeToggle";
import clsx from "clsx";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useCart } from "@/store/useCart";
import { useFavorites } from "@/store/useFavorites";
import { useCompare } from "@/store/useCompare";

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
  // ✨ FIX 1: useCart dan to'g'ri obuna bo'lish - Har bir qiymat alohida selector orqali olinadi.
  const cartCountFromStore = useCart(state => state.totalItems);
  const cartTotalFromStore = useCart(state => state.total);

  // ✨ FIX: useFavorites dan to'g'ri obuna bo'lish - count property dan foydalanish
  const wishlistCountFromStore = useFavorites(state => state.count);
  
  // ✨ FIX: useCompare dan to'g'ri obuna bo'lish - count property dan foydalanish
  const compareCountFromStore = useCompare(state => state.count);

  // Hydrationni boshqarish uchun mounted state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  // Mounted bo'lmaguncha 0 qiymatidan foydalanishni ta'minlaymiz
  const wishlistCount = mounted ? wishlistCountFromStore : 0;
  const compareCount = mounted ? compareCountFromStore : 0;
  const displayCartCount = mounted ? cartCountFromStore : 0;
  const displayCartTotal = mounted ? cartTotalFromStore : 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isOpen, open, close: closeCallback } = useModal();
  const { 
    isOpen: isSuccessOpen, 
    open: openSuccess, 
    close: closeSuccess 
  } = useModal();

  const close = () => {
    setSubmitError(null);
    setIsSubmitting(false);
    closeCallback();
  };

  const handleSubmit = async (data: CallbackFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch("/api/telegram/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Ошибка при отправке заявки");
      }

      // Close callback form and show success modal
      closeCallback();
      openSuccess();
    } catch (error) {
      console.error("Error submitting callback form:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ошибка при отправке заявки. Попробуйте позже."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  className="text-sm text-orange underline hover:text-orange/80 transition-colors"
                >
                  Заказать звонок
                </button>
              </div>

              <div className="text-white hidden xl:block shrink-0">
                <p className="text-sm">Время работы: 10:00-20:00</p>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <ThemeToggle />

                <div className="hidden lg:flex items-center gap-2 md:gap-4">
                  {/* Izlangan mahsulotlar (Desktop) */}
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

                  {/* Qiyoslash (Desktop) */}
                  <Link
                    href="/compare"
                    className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors"
                    aria-label="Сравнение"
                  >
                    <FiBarChart2 size={20} />
                    {compareCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                        {compareCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors"
                    aria-label="Профиль"
                  >
                    <FiUser size={20} />
                  </Link>

                  {/* Savatcha (Desktop) */}
                  <Link
                    href="/cart"
                    className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white hover:text-orange transition-colors lg:w-10"
                    aria-label="Корзина"
                  >
                    <FiShoppingCart size={20} />
                    {displayCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                        {displayCartCount}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="hidden sm:block ml-2 md:ml-4 text-white">
                  <p className="text-xs">Товаров на сумму</p>
                  <p className="text-sm font-bold">
                    {displayCartTotal.toLocaleString("ru-RU")} ₽
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  open();
                }}
                className="text-lg text-orange underline hover:text-orange/80 transition-colors block text-left"
              >
                Заказать звонок
              </button>
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
          {submitError && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {submitError}
            </div>
          )}
          <CallbackForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </Modal>

        <SuccessModal
          isOpen={isSuccessOpen}
          onClose={closeSuccess}
          title="Заявка принята"
          message="Спасибо за заявку! Мы свяжемся с вами в ближайшее время."
          buttonText="ОК"
          onButtonClick={closeSuccess}
        />
      </header>

      <MobileFixedNav
        wishlistCount={wishlistCount}
        compareCount={compareCount}
        cartCount={displayCartCount}
        openCallbackModal={open}
      />
    </>
  );
}