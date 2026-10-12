import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  AuditEntry,
  AuditFilters,
  Brand,
  BrandInput,
  Category,
  CategoryInput,
  Dashboard,
  MediaOut,
  Order,
  OrderFilters,
  OrderStatus,
  Page,
  PaymentStatus,
  Product,
  ProductFilters,
  ProductInput,
  StaffInput,
  UserAdmin,
  UserFilters,
  Role,
} from "./types";

export const qk = {
  dashboard: ["dashboard"] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  products: (f: ProductFilters) => ["products", f] as const,
  product: (id: number) => ["product", id] as const,
  orders: (f: OrderFilters) => ["orders", f] as const,
  order: (id: string) => ["order", id] as const,
  users: (f: UserFilters) => ["users", f] as const,
  audit: (f: AuditFilters) => ["audit", f] as const,
};

// ---------- dashboard ----------
export const useDashboard = (enabled = true) =>
  useQuery({ queryKey: qk.dashboard, queryFn: ({ signal }) => api<Dashboard>("/admin/dashboard", { signal }), enabled });

// ---------- categories ----------
export const useCategories = (enabled = true) =>
  useQuery({
    queryKey: qk.categories,
    queryFn: ({ signal }) => api<Category[]>("/admin/categories", { signal }),
    staleTime: 60_000,
    enabled,
  });

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Partial<CategoryInput> }) =>
      id
        ? api<Category>(`/admin/categories/${id}`, { method: "PATCH", body: data })
        : api<Category>("/admin/categories", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

// ---------- brands ----------
export const useBrands = (enabled = true) =>
  useQuery({
    queryKey: qk.brands,
    queryFn: ({ signal }) => api<Brand[]>("/admin/brands", { signal }),
    staleTime: 60_000,
    enabled,
  });

export function useSaveBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Partial<BrandInput> }) =>
      id
        ? api<Brand>(`/admin/brands/${id}`, { method: "PATCH", body: data })
        : api<Brand>("/admin/brands", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.brands }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/brands/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.brands }),
  });
}

// ---------- products ----------
export const useProducts = (f: ProductFilters) =>
  useQuery({
    queryKey: qk.products(f),
    queryFn: ({ signal }) => api<Page<Product>>("/admin/products", { query: { ...f }, signal }),
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: number | undefined) =>
  useQuery({
    queryKey: qk.product(id ?? 0),
    queryFn: ({ signal }) => api<Product>(`/admin/products/${id}`, { signal }),
    enabled: id !== undefined,
  });

function useProductCacheSync() {
  const qc = useQueryClient();
  return (p: Product) => {
    qc.setQueryData(qk.product(p.id), p);
    void qc.invalidateQueries({ queryKey: ["products"] });
    void qc.invalidateQueries({ queryKey: qk.dashboard });
  };
}

export function useSaveProduct() {
  const sync = useProductCacheSync();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Partial<ProductInput> }) =>
      id
        ? api<Product>(`/admin/products/${id}`, { method: "PATCH", body: data })
        : api<Product>("/admin/products", { method: "POST", body: data }),
    onSuccess: sync,
  });
}

/** Optimistic active toggle in list views. */
export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api<Product>(`/admin/products/${id}`, { method: "PATCH", body: { is_active } }),
    onMutate: async ({ id, is_active }) => {
      await qc.cancelQueries({ queryKey: ["products"] });
      const snapshots = qc.getQueriesData<Page<Product>>({ queryKey: ["products"] });
      qc.setQueriesData<Page<Product>>({ queryKey: ["products"] }, (old) =>
        old ? { ...old, items: old.items.map((p) => (p.id === id ? { ...p, is_active } : p)) } : old,
      );
      return { snapshots };
    },
    onError: (_e, _v, ctx) => ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAdjustStock() {
  const sync = useProductCacheSync();
  return useMutation({
    mutationFn: ({ id, delta, reason }: { id: number; delta: number; reason: string }) =>
      api<Product>(`/admin/products/${id}/stock`, { method: "POST", body: { delta, reason } }),
    onSuccess: sync,
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: qk.product(id) });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ---------- media ----------
export function uploadMedia(file: File, signal?: AbortSignal): Promise<MediaOut> {
  const fd = new FormData();
  fd.append("file", file);
  return api<MediaOut>("/admin/media", { method: "POST", body: fd, signal });
}

// ---------- orders ----------
export const useOrders = (f: OrderFilters) =>
  useQuery({
    queryKey: qk.orders(f),
    queryFn: ({ signal }) => api<Page<Order>>("/admin/orders", { query: { ...f }, signal }),
    placeholderData: keepPreviousData,
  });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: qk.order(id ?? ""),
    queryFn: ({ signal }) => api<Order>(`/admin/orders/${id}`, { signal }),
    enabled: !!id,
  });

function useOrderCacheSync() {
  const qc = useQueryClient();
  return (o: Order) => {
    qc.setQueryData(qk.order(o.id), o);
    void qc.invalidateQueries({ queryKey: ["orders"] });
    void qc.invalidateQueries({ queryKey: qk.dashboard });
  };
}

export function useOrderTransition() {
  const sync = useOrderCacheSync();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      api<Order>(`/admin/orders/${id}/status`, { method: "POST", body: { status, note: note || null } }),
    onSuccess: (o, v) => {
      sync(o);
      // Cancelling restocks products.
      if (v.status === "cancelled") void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function usePatchOrder() {
  const sync = useOrderCacheSync();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { staff_note?: string | null; payment_status?: PaymentStatus } }) =>
      api<Order>(`/admin/orders/${id}`, { method: "PATCH", body: data }),
    onSuccess: sync,
  });
}

// ---------- users ----------
export const useUsers = (f: UserFilters) =>
  useQuery({
    queryKey: qk.users(f),
    queryFn: ({ signal }) => api<Page<UserAdmin>>("/admin/users", { query: { ...f }, signal }),
    placeholderData: keepPreviousData,
  });

export function usePatchUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { role?: Role; is_active?: boolean } }) =>
      api<UserAdmin>(`/admin/users/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StaffInput) => api<UserAdmin>("/admin/staff", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ---------- audit ----------
export const useAudit = (f: AuditFilters) =>
  useQuery({
    queryKey: qk.audit(f),
    queryFn: ({ signal }) => api<Page<AuditEntry>>("/admin/audit", { query: { ...f }, signal }),
    placeholderData: keepPreviousData,
  });
