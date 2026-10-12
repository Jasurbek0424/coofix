import { Loader2Icon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Navigate, type RouteObject, useLocation } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav";
import type { Permission } from "@/lib/permissions";
import { ErrorPage, ForbiddenPage, NotFoundPage } from "@/pages/status-pages";

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" />
      {t.app.loading}
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Splash />;
  if (status === "anonymous") {
    const next = location.pathname + location.search;
    return <Navigate to={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}

function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? children : <ForbiddenPage />;
}

/** "/" shows the dashboard if allowed, otherwise the first section the role can open. */
function Home({ children }: { children: ReactNode }) {
  const { can } = useAuth();
  if (can("orders.read")) return children;
  const first = NAV_ITEMS.find((i) => can(i.permission));
  return first ? <Navigate to={first.to} replace /> : <ForbiddenPage />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Splash />;
  if (status === "authenticated") {
    const next = new URLSearchParams(location.search).get("next");
    return <Navigate to={next && next.startsWith("/") && !next.startsWith("//") ? next : "/"} replace />;
  }
  return children;
}

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

const guarded = (permission: Permission, load: () => Promise<{ default: ComponentType }>): Pick<RouteObject, "lazy"> => ({
  lazy: async () => {
    const C = (await load()).default;
    return {
      Component: () => (
        <Guard permission={permission}>
          <C />
        </Guard>
      ),
    };
  },
});

export const routes: RouteObject[] = [
  {
    path: "/login",
    errorElement: <ErrorPage />,
    lazy: async () => {
      const C = (await import("@/pages/login")).default;
      return {
        Component: () => (
          <GuestOnly>
            <C />
          </GuestOnly>
        ),
      };
    },
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => {
          const C = (await import("@/pages/dashboard")).default;
          return {
            Component: () => (
              <Home>
                <C />
              </Home>
            ),
          };
        },
      },
      { path: "products", ...guarded("catalog.write", () => import("@/pages/products/products-list")) },
      { path: "products/new", ...guarded("catalog.write", () => import("@/pages/products/product-edit")) },
      { path: "products/:id", ...guarded("catalog.write", () => import("@/pages/products/product-edit")) },
      { path: "categories", ...guarded("catalog.write", () => import("@/pages/categories")) },
      { path: "brands", ...guarded("catalog.write", () => import("@/pages/brands")) },
      { path: "orders", ...guarded("orders.read", () => import("@/pages/orders/orders-list")) },
      { path: "orders/:id", ...guarded("orders.read", () => import("@/pages/orders/order-page")) },
      { path: "users", ...guarded("customers.read", () => import("@/pages/users")) },
      { path: "audit", ...guarded("audit.read", () => import("@/pages/audit")) },
      { path: "*", lazy: page(async () => ({ default: NotFoundPage })) },
    ],
  },
];
