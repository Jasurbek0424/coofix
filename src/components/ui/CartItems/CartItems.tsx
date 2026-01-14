// src/app/cart/page.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useUser } from "@/store/useUser";
import Link from "next/link";
import Image from "next/image";
import { FiTrash2 } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { SuccessModal } from "@/components/ui/Modal";
import { OrderForm } from "@/components/ui/Forms";
import { useModal } from "@/hooks/useModal";
import type { OrderFormData } from "@/lib/validations";
import { useRouter } from "next/navigation";

const formatPrice = (price: number) => 
  price.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export default function CartItems() {
  const { items, total, removeItem, incrementItem, decrementItem, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { isOpen, open, close } = useModal();
  const { 
    isOpen: isSuccessOpen, 
    open: openSuccess, 
    close: closeSuccess 
  } = useModal();

  const handleOrderSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Prepare order items
      const orderItems = items.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          items: orderItems,
          total: total,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Ошибка при оформлении заказа");
      }

      // Clear cart and close form
      clearCart();
      close();
      openSuccess();
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ошибка при оформлении заказа. Попробуйте позже."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    closeSuccess();
    router.push("/");
  };

  // Get default values from user profile if available
  const getDefaultValues = (): Partial<OrderFormData> => {
    if (!user) return { phone: "+7" };
    
    return {
      firstName: user.firstName || user.name?.split(" ")[0] || "",
      lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
      phone: user.phone || "+7",
      email: user.email || "",
      city: user.city || "",
      street: user.street || "",
      building: user.building || "",
      house: user.house || "",
      apartment: user.apartment || "",
    };
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center h-screen min-h-[500px]">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Корзина пуста</h1>
        <p className="text-lg text-smoky mb-8">
          Добавьте товары, чтобы совершить покупку.
        </p>
        <Link href="/catalog" className="bg-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-orange/80 transition-colors shadow-md">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Ваша корзина ({items.length})</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const productTotal = item.product.price * item.quantity;

            return (
                <div 
                    key={item.product._id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center bg-white dark:bg-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-coal transition-shadow hover:shadow-md"
                >
                    
                    {/* Rasm va Link */}
                    <Link href={`/product/${item.product.slug}`} className="shrink-0 mr-4">
                        <Image
                            src={typeof item.product.images?.[0] === "string" ? item.product.images[0] : "/placeholder-product.png"}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="object-contain rounded-md"
                        />
                    </Link>
                    
                    <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                        {/* Nomi */}
                        <Link href={`/product/${item.product.slug}`} className="text-lg font-medium text-foreground hover:text-orange transition-colors line-clamp-2">
                            {item.product.name}
                        </Link>
                        {/* Narxi (birlik uchun) */}
                        <p className="text-sm text-smoky mt-1">
                            Цена за шт: <span className="font-semibold">{formatPrice(item.product.price)}</span>
                        </p>
                    </div>

                    <div className="flex flex-row items-center gap-4 mt-4 sm:mt-0 sm:ml-4 shrink-0 justify-between w-full sm:w-auto">
                        
                        {/* Miqdorni boshqarish tugmalari */}
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button 
                                onClick={() => decrementItem(item.product._id)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-lg text-foreground disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-coal/50 rounded-l-lg transition-colors"
                                aria-label="Уменьшить количество"
                            >
                                -
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center border-l border-r border-gray-300 dark:border-gray-600 text-foreground text-base font-medium">
                                {item.quantity}
                            </span>
                            <button 
                                onClick={() => incrementItem(item.product._id)}
                                className="w-8 h-8 flex items-center justify-center text-lg text-foreground hover:bg-gray-100 dark:hover:bg-coal/50 rounded-r-lg transition-colors"
                                aria-label="Увеличить количество"
                            >
                                +
                            </button>
                        </div>
                        
                        {/* Umumiy narx */}
                        <p className="font-bold text-lg text-foreground min-w-[100px] text-right">
                            {formatPrice(productTotal)}
                        </p>

                        {/* O'chirish tugmasi */}
                        <button 
                            onClick={() => removeItem(item.product._id)}
                            className="text-gray-500 hover:text-red-500 transition-colors text-xl p-2 rounded-full"
                            aria-label="Удалить из корзины"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    </div>
                </div>
            );
          })}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl border border-gray-200 dark:border-coal sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-foreground border-b pb-2 border-gray-200 dark:border-coal/50">Итого</h2>
            <div className="space-y-3 mb-6">
              {/* Mahsulotlar soni va narxi */}
              <div className="flex justify-between text-base text-smoky">
                <span>Товаров ({useCart.getState().totalItems} шт.):</span> {/* to'g'ri totalItems dan olish uchun .getState() ishlatildi (lekin komponentda items.length ham ishlatilishi mumkin) */}
                <span>{formatPrice(total)}</span>
              </div>
              {/* Yetkazib berish (Misol) */}
              <div className="flex justify-between text-base text-smoky">
                <span>Доставка:</span>
                <span className="text-green-500 font-semibold">Бесплатно</span>
              </div>
              
              {/* Jami Summa */}
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-200 dark:border-coal/50 text-orange">
                <span>Общая сумма:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={open}
              className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/80 transition-colors text-lg shadow-md"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      <Modal isOpen={isOpen} onClose={close} title="Оформить заказ">
        {submitError && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {submitError}
          </div>
        )}
        <OrderForm 
          onSubmit={handleOrderSubmit} 
          isLoading={isSubmitting}
          defaultValues={getDefaultValues()}
        />
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={closeSuccess}
        title="Заказ оформлен"
        message="Спасибо за заказ! Мы свяжемся с вами для подтверждения в ближайшее время."
        buttonText="НА ГЛАВНУЮ"
        onButtonClick={handleSuccessClose}
      />
    </div>
  );
}