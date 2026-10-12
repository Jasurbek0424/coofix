"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/store/useUser";
import { getOrders } from "@/api/orders";
import type { Order } from "@/types/order";
import { Loader } from "@/components/shared/Loader";
import Image from "next/image";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading: authLoading, fetchProfile, logout } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Check if it's an unauthorized error (401)
      if (
        error instanceof Error &&
        "isUnauthorized" in error &&
        (error as { isUnauthorized: boolean }).isUnauthorized
      ) {
        // Clear auth state and redirect to login
        await logout();
        router.push("/login");
        return;
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Faqat bir marta yuklash
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchProfile();
      loadOrders();
    }
  }, [isAuthenticated, authLoading, router, fetchProfile, loadOrders]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-smoky">
        <p className="text-lg">У вас нет ещё заказов</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order._id;
        return (
          <div
            key={order._id}
            className="border border-gray rounded-lg overflow-hidden"
          >
            {/* Order Header */}
            <div
              className="p-4 bg-dark/5 hover:bg-dark/10 cursor-pointer transition-colors flex items-center justify-between"
              onClick={() => toggleOrder(order._id)}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-semibold text-foreground">
                    Заказ № {order.orderNumber || order._id.slice(-5)}
                  </span>
                  <span className="text-smoky">
                    Создан: {formatDate(order.createdAt)}
                  </span>
                  {order.receivedAt && (
                    <span className="text-smoky">
                      Получен: {formatDate(order.receivedAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <FiChevronUp className="text-smoky" size={20} />
                ) : (
                  <FiChevronDown className="text-smoky" size={20} />
                )}
              </div>
            </div>

            {/* Order Details */}
            {isExpanded && (
              <div className="p-4 border-t border-gray max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {order.items.map((item, index) => {
                    if (!item.product) {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 pb-3 border-b border-gray/50 last:border-0"
                        >
                          <div className="shrink-0 w-16 h-16 bg-gray rounded overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full bg-gray flex items-center justify-center text-xs text-smoky">
                              Нет фото
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              Товар удален
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-smoky text-sm">
                                {item.price} ₽ × {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="font-semibold text-foreground">
                              {item.price * item.quantity} ₽
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const productImage = item.product.images?.[0];
                    const imageUrl = typeof productImage === "string" 
                      ? productImage 
                      : (productImage && typeof productImage === "object" && "url" in productImage)
                      ? productImage.url
                      : null;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 pb-3 border-b border-gray/50 last:border-0"
                      >
                        <div className="shrink-0 w-16 h-16 bg-gray rounded overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.product.name || "Product"}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized={imageUrl.startsWith("http") || imageUrl.startsWith("//")}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray flex items-center justify-center text-xs text-smoky">
                              Нет фото
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {item.product.name || "Товар"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-smoky text-sm">
                              {item.price} ₽ × {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="font-semibold text-foreground">
                            {item.price * item.quantity} ₽
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-gray">
                  <div className="flex justify-end">
                    <span className="text-lg font-bold text-foreground">
                      Итого: {order.total.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
