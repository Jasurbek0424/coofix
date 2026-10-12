/** Wire types — mirror docs/api/openapi.json (admin subset). */

export type Role = "customer" | "support" | "content" | "manager" | "admin";
export type I18n = Partial<Record<"ru" | "zh", string>>;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

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

export interface UserAdmin extends User {
  is_active: boolean;
  last_login_at: string | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Seo {
  title?: I18n;
  description?: I18n;
}

export interface Category {
  id: number;
  parent_id: number | null;
  slug: string;
  name: I18n;
  description: I18n;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  seo: Seo;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: I18n;
  slug?: string | null;
  parent_id: number | null;
  description: I18n;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  seo: Seo;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BrandInput {
  name: string;
  slug?: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface ProductImage {
  url: string;
  alt: string | null;
}

export interface Product {
  id: number;
  slug: string;
  sku: string | null;
  name: I18n;
  description: I18n;
  category_id: number;
  brand_id: number | null;
  price_minor: number;
  old_price_minor: number | null;
  stock: number;
  images: ProductImage[];
  attributes: Record<string, string>;
  is_active: boolean;
  is_new: boolean;
  is_hit: boolean;
  rating_avg: string;
  rating_count: number;
  seo: Seo;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: I18n;
  slug?: string | null;
  sku: string | null;
  description: I18n;
  category_id: number;
  brand_id: number | null;
  price_minor: number;
  old_price_minor: number | null;
  stock?: number;
  images: ProductImage[];
  attributes: Record<string, string>;
  is_active: boolean;
  is_new: boolean;
  is_hit: boolean;
  seo: Seo;
}

export interface ProductFilters {
  q?: string;
  category_id?: number;
  brand_id?: number;
  is_active?: boolean;
  low_stock?: boolean;
  page?: number;
  per_page?: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cash_on_delivery" | "card_on_delivery" | "invoice" | "online";
export type DeliveryMethod = "pickup" | "courier";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "pending", "paid", "refunded", "failed"];

/** Mirror of ORDER_TRANSITIONS in apps/api/app/models/commerce.py. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

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
  events: OrderEvent[];
  user_id: number | null;
  staff_note: string | null;
  updated_at: string;
}

export interface OrderFilters {
  q?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface UserFilters {
  q?: string;
  role?: Role;
  page?: number;
  per_page?: number;
}

export interface AuditEntry {
  id: number;
  actor_user_id: number | null;
  action: string;
  entity: string;
  entity_id: string | null;
  data: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

export interface AuditFilters {
  entity?: string;
  entity_id?: string;
  actor_user_id?: number;
  page?: number;
  per_page?: number;
}

export interface Dashboard {
  revenue_minor_30d: number;
  orders_30d: number;
  pending_orders: number;
  new_customers_30d: number;
  low_stock_products: number;
  daily: { date: string; orders: number; revenue_minor: number }[];
}

export interface MediaOut {
  url: string;
  width: number;
  height: number;
}

export interface StaffInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string | null;
  role: Role;
}
