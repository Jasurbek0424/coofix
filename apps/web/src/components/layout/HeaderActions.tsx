"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/stores/auth";
import { useCompare, useHydrated } from "@/stores/local";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon, type IconName } from "@/components/ui/Icon";

export function CountBadge({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -right-1.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-on-brand ring-2 ring-surface tabular animate-pop",
        className,
      )}
      aria-hidden="true"
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function useBadgeCounts() {
  const hydrated = useHydrated((s) => s.done);
  const cart = useCart();
  const fav = useFavorites();
  const compare = useCompare((s) => s.ids.length);
  const authReady = useAuth((s) => s.status !== "loading");
  return {
    cart: hydrated && authReady ? cart.count : 0,
    favorites: hydrated && authReady ? fav.count : 0,
    compare: hydrated ? compare : 0,
  };
}

function Action({ href, icon, label, count, className }: { href: string; icon: IconName; label: string; count?: number; className?: string }) {
  const sr = count ? `${label}: ${count}` : label;
  return (
    <Link
      href={href}
      aria-label={sr}
      className={cn(
        "group relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-ink-2 transition-colors hover:text-ink",
        className,
      )}
    >
      <span className="relative">
        <Icon name={icon} className="size-6 transition-transform group-hover:-translate-y-px" />
        <CountBadge n={count ?? 0} />
      </span>
      <span className="hidden text-[11px] font-medium xl:block">{label}</span>
    </Link>
  );
}

export function HeaderActions() {
  const counts = useBadgeCounts();
  const user = useAuth((s) => s.user);
  return (
    <nav aria-label={t("header.account")} className="flex items-center gap-0.5 sm:gap-1">
      <Action href="/compare" icon="compare" label={t("header.compare")} count={counts.compare} className="hidden lg:flex" />
      <Action href="/favorites" icon="heart" label={t("header.favorites")} count={counts.favorites} className="hidden sm:flex" />
      <Action href={user ? "/account" : "/login"} icon="user" label={user ? user.first_name || t("header.account") : t("header.login")} className="hidden lg:flex" />
      <Action href="/cart" icon="cart" label={t("header.cart")} count={counts.cart} />
    </nav>
  );
}
