"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CountBadge, useBadgeCounts } from "./HeaderActions";

export function MobileTabBar() {
  const pathname = usePathname();
  const counts = useBadgeCounts();
  const user = useAuth((s) => s.user);
  const items: { href: string; icon: IconName; label: string; count?: number; match: (p: string) => boolean }[] = [
    { href: "/", icon: "store", label: t("common.home"), match: (p) => p === "/" },
    { href: "/catalog", icon: "grid", label: t("common.catalog"), match: (p) => p.startsWith("/catalog") || p.startsWith("/product") || p.startsWith("/search") },
    { href: "/favorites", icon: "heart", label: t("header.favorites"), count: counts.favorites, match: (p) => p.startsWith("/favorites") },
    { href: "/cart", icon: "cart", label: t("header.cart"), count: counts.cart, match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") },
    { href: user ? "/account" : "/login", icon: "user", label: user ? t("header.account") : t("header.login"), match: (p) => ["/account", "/login", "/register"].some((x) => p.startsWith(x)) },
  ];
  return (
    <nav aria-label={t("header.mainNav")} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid h-16 grid-cols-5">
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <li key={it.label}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className={cn("flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-brand-text" : "text-muted")}>
                <span className="relative">
                  <Icon name={it.icon} className="size-6" strokeWidth={active ? 2.1 : 1.75} />
                  <CountBadge n={it.count ?? 0} />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
