/** Types mirroring docs/api/openapi.json (store-facing subset). */

export type StockLevel = "out" | "low" | "in";

export interface ApiImage {
  url: string;
  alt?: string | null;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
}

export interface CategoryNode {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  children: CategoryNode[];
}

export interface Crumb {
  slug: string;
  name: string;
}

export interface Seo {
  title?: string;
  description?: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  breadcrumbs: Crumb[];
  children: CategoryNode[];
  seo: Seo;
}

export interface ProductCard {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  price_minor: number;
  old_price_minor: number | null;
  currency: string;
  image: ApiImage | null;
  stock_level: StockLevel;
  is_new: boolean;
  is_hit: boolean;
  rating_avg: string;
  rating_count: number;
  brand: Brand | null;
}

export interface ProductDetail extends ProductCard {
  description: string;
  images: ApiImage[];
  attributes: Record<string, string>;
  category: Crumb;
  breadcrumbs: Crumb[];
  seo: Seo;
}

export interface ProductPage {
  items: ProductCard[];
  total: number;
  page: number;
  per_page: number;
  price_min: number;
  price_max: number;
}

export type ProductSort = "popular" | "new" | "price_asc" | "price_desc" | "name";

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string[];
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  is_new?: boolean;
  is_hit?: boolean;
  on_sale?: boolean;
  sort?: ProductSort;
  page?: number;
  per_page?: number;
}

export type Role = "customer" | "support" | "content" | "manager" | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  role: Role;
  email_verified_at: string | null;
  created_at: string;
}

export interface TokenOut {
  access_token: string;
  token_type?: string;
  expires_in: number;
  user: User;
}

export interface CartLineIn {
  product_id: number;
  quantity: number;
}

export interface CartLine {
  product: ProductCard;
  quantity: number;
  line_total_minor: number;
  available: boolean;
}

export interface Cart {
  items: CartLine[];
  subtotal_minor: number;
  currency: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cash_on_delivery" | "card_on_delivery" | "invoice" | "online";
export type DeliveryMethod = "pickup" | "courier";

export interface OrderItem {
  product_id: number | null;
  sku: string | null;
  name: string;
  unit_price_minor: number;
  quantity: number;
  line_total_minor: number;
}

export interface OrderEvent {
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  comment: string | null;
  currency: string;
  subtotal_minor: number;
  delivery_minor: number;
  total_minor: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderDetail extends Order {
  events: OrderEvent[];
}

export interface CheckoutIn {
  items: CartLineIn[];
  customer_name: string;
  phone: string;
  email?: string | null;
  delivery_method: DeliveryMethod;
  address?: string | null;
  payment_method: Exclude<PaymentMethod, "online">;
  comment?: string | null;
  expected_total_minor?: number | null;
}

export interface CheckoutOut {
  order: Order;
  access_token: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface StockProblem {
  product_id: number;
  reason: "unavailable" | "insufficient_stock";
  available: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: { loc: string[]; type: string; msg: string }[];
    items?: StockProblem[];
    total_minor?: number;
  };
}
