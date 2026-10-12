import type { Role } from "@/api/types";

export type Permission =
  | "catalog.write"
  | "reviews.moderate"
  | "orders.read"
  | "orders.write"
  | "customers.read"
  | "staff.manage"
  | "audit.read";

/** Mirror of apps/api/app/core/deps.py PERMISSIONS — UI hint only; the server enforces. */
export const PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  customer: new Set(),
  support: new Set(["orders.read", "orders.write", "customers.read"]),
  content: new Set(["catalog.write", "reviews.moderate"]),
  manager: new Set(["catalog.write", "reviews.moderate", "orders.read", "orders.write", "customers.read"]),
  admin: new Set([
    "catalog.write",
    "reviews.moderate",
    "orders.read",
    "orders.write",
    "customers.read",
    "staff.manage",
    "audit.read",
  ]),
};

export const STAFF_ROLES = ["support", "content", "manager", "admin"] as const satisfies readonly Role[];

export function can(role: Role | undefined, p: Permission): boolean {
  return role ? PERMISSIONS[role].has(p) : false;
}
