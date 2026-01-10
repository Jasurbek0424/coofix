import type { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
  _id?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
}
