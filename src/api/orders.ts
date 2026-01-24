import { apiAuth } from "./axios";
import type { OrdersResponse, Order } from "@/types/order";

// GET /orders/my - Получить список заказов текущего пользователя
export async function getOrders(): Promise<Order[]> {
  const res = await apiAuth.get<OrdersResponse>("/orders/my");
  // Response: { success: true, orders: [] }
  if (res.data.success && Array.isArray(res.data.orders)) {
    return res.data.orders;
  }
  return [];
}

// GET /orders/:id - Получить заказ по ID (используется при необходимости)
export async function getOrderById(orderId: string): Promise<Order | null> {
  const res = await apiAuth.get<{ success: boolean; order?: Order }>(
    `/orders/${orderId}`
  );
  if (res.data.success && res.data.order) {
    return res.data.order;
  }
  return null;
}

