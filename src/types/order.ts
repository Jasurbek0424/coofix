import type { Product } from "./product";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  _id?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  receivedAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse {
  success: boolean;
  orders?: Order[];
  message?: string;
}

