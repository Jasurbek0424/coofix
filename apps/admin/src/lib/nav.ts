import {
  FolderTreeIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  PackageIcon,
  ScrollTextIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { t } from "@/i18n/ru";
import type { Permission } from "./permissions";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  /** Keyboard shortcut: g + key */
  key: string;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  { items: [{ to: "/", label: t.nav.dashboard, icon: LayoutDashboardIcon, permission: "orders.read", key: "d" }] },
  {
    label: t.nav.sectionSales,
    items: [
      { to: "/orders", label: t.nav.orders, icon: ShoppingCartIcon, permission: "orders.read", key: "o" },
      { to: "/users", label: t.nav.users, icon: UsersIcon, permission: "customers.read", key: "u" },
    ],
  },
  {
    label: t.nav.sectionCatalog,
    items: [
      { to: "/products", label: t.nav.products, icon: PackageIcon, permission: "catalog.write", key: "p" },
      { to: "/categories", label: t.nav.categories, icon: FolderTreeIcon, permission: "catalog.write", key: "c" },
      { to: "/brands", label: t.nav.brands, icon: TagIcon, permission: "catalog.write", key: "b" },
    ],
  },
  {
    label: t.nav.sectionSystem,
    items: [{ to: "/audit", label: t.nav.audit, icon: ScrollTextIcon, permission: "audit.read", key: "a" }],
  },
];

export const NAV_ITEMS = NAV.flatMap((s) => s.items);
