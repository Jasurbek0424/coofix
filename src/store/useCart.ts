// src/store/useCart.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  totalItems: number;

  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  clearCart: () => void;
  
  // ✨ FIX: Qo'shimcha funksiyalar interface'ga qo'shildi
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
}

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  return { total, totalItems };
};


export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      totalItems: 0,

      addItem: (product: Product, quantity: number) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product._id === product._id
          );

          let newItems: CartItem[];
          
          if (existingItemIndex > -1) {
            // Mahsulot allaqachon mavjud, miqdorni oshirish
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Yangi mahsulot, ro'yxatga qo'shish
            newItems = [...state.items, { product, quantity }];
          }

          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.product._id !== productId
          );
          
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },
      
      // ✨ FIX: incrementItem funksiyasi implementatsiyasi
      incrementItem: (productId: string) => {
        set((state) => {
            const newItems = state.items.map(item => 
                item.product._id === productId 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            return {
                items: newItems,
                ...calculateTotals(newItems),
            };
        });
      },

      // ✨ FIX: decrementItem funksiyasi implementatsiyasi
      decrementItem: (productId: string) => {
        set((state) => {
            const newItems: CartItem[] = [];
            
            state.items.forEach(item => {
                if (item.product._id === productId) {
                    // Miqdorni kamaytiramiz
                    const newQuantity = item.quantity - 1;
                    if (newQuantity > 0) {
                        newItems.push({ ...item, quantity: newQuantity });
                    }
                    // Agar newQuantity 0 bo'lsa, mahsulot ro'yxatga qo'shilmaydi (ya'ni o'chiriladi)
                } else {
                    newItems.push(item);
                }
            });
            
            return {
                items: newItems,
                ...calculateTotals(newItems),
            };
        });
      },

      isInCart: (productId: string) => {
        return get().items.some((item) => item.product._id === productId);
      },
      
      clearCart: () => set({ items: [], total: 0, totalItems: 0 }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        // ✨ FIX: Reload qilinganda totals ni qayta hisoblash
        if (state?.items && state.items.length > 0) {
          const { total, totalItems } = calculateTotals(state.items);
          state.total = total;
          state.totalItems = totalItems;
        }
      },
    }
  )
);