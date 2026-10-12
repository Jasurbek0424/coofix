"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare, useHydrated } from "@/stores/local";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import type { ProductCard } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Button, buttonClass } from "@/components/ui/Button";

export function FavoriteButton({ product, className, withLabel }: { product: ProductCard; className?: string; withLabel?: boolean }) {
  const fav = useFavorites();
  const hydrated = useHydrated((s) => s.done);
  const authReady = useAuth((s) => s.status) !== "loading";
  const ready = hydrated && authReady;
  const on = ready && fav.has(product.id);
  const [pop, setPop] = useState(0);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t("product.removeFromFavorites") : t("product.addToFavorites")}
      title={on ? t("product.removeFromFavorites") : t("product.addToFavorites")}
      onClick={() => {
        if (fav.toggle(product)) setPop((n) => n + 1);
      }}
      className={cn(
        withLabel
          ? buttonClass("outline", "md", "gap-2")
          : "grid size-9 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-sm ring-1 ring-line backdrop-blur transition-colors hover:text-danger",
        on && "text-danger",
        className,
      )}
    >
      <Icon key={pop} name="heart" fill={on ? "currentColor" : "none"} className={cn("size-[18px]", pop > 0 && on && "animate-pop")} />
      {withLabel && <span>{on ? t("product.removeFromFavorites") : t("product.addToFavorites")}</span>}
    </button>
  );
}

export function CompareButton({ productId, className, withLabel }: { productId: number; className?: string; withLabel?: boolean }) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const ready = useHydrated((s) => s.done);
  const on = ready && ids.includes(productId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t("product.removeFromCompare") : t("product.addToCompare")}
      title={on ? t("product.removeFromCompare") : t("product.addToCompare")}
      onClick={() => {
        const wasOn = on;
        if (!toggle(productId)) toast({ title: t("product.compareFull"), tone: "danger", action: { label: t("nav.compare"), href: "/compare" } });
        else if (!wasOn) toast({ title: t("product.addToCompare"), action: { label: t("nav.compare"), href: "/compare" } });
      }}
      className={cn(
        withLabel
          ? buttonClass("outline", "md", "gap-2")
          : "grid size-9 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-sm ring-1 ring-line backdrop-blur transition-colors hover:text-brand-text",
        on && "text-brand-text",
        className,
      )}
    >
      <Icon name="compare" className="size-[18px]" strokeWidth={on ? 2.4 : 1.75} />
      {withLabel && <span>{on ? t("product.removeFromCompare") : t("product.addToCompare")}</span>}
    </button>
  );
}

export function QtyStepper({ value, onChange, max = 999, size = "md", label, className }: { value: number; onChange: (n: number) => void; max?: number; size?: "sm" | "md"; label?: string; className?: string }) {
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-line-strong bg-surface", h, className)} role="group" aria-label={label ?? t("product.quantity")}>
      <button type="button" onClick={() => onChange(value - 1)} className={cn("grid place-items-center rounded-l-lg text-ink-2 hover:bg-surface-3", h, size === "sm" ? "w-8" : "w-10")} aria-label={t("product.decrease")}>
        <Icon name="minus" className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        aria-label={t("product.quantity")}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(1, n)));
        }}
        className={cn("w-10 min-w-0 flex-1 bg-transparent text-center text-[15px] font-semibold tabular focus:outline-none", h)}
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={cn("grid place-items-center rounded-r-lg text-ink-2 hover:bg-surface-3 disabled:opacity-40", h, size === "sm" ? "w-8" : "w-10")} aria-label={t("product.increase")}>
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  );
}

/** Card-level add-to-cart: becomes an inline stepper once the product is in the cart. */
export function AddToCartButton({ product, className, size = "md" }: { product: ProductCard; className?: string; size?: "sm" | "md" | "lg" }) {
  const cart = useCart();
  const hydrated = useHydrated((s) => s.done);
  const qty = hydrated ? cart.quantityOf(product.id) : 0;

  if (product.stock_level === "out") {
    return (
      <Button variant="soft" size={size} disabled className={cn("w-full", className)}>
        {t("product.outOfStock")}
      </Button>
    );
  }

  if (qty > 0 && size === "sm") {
    return (
      <QtyStepper
        value={qty}
        size="sm"
        onChange={(n) => cart.setQty(product.id, n)}
        className={cn("w-full border-brand bg-brand-soft", className)}
      />
    );
  }

  if (qty > 0) {
    return (
      <div className={cn("flex w-full items-center gap-2", className)}>
        <QtyStepper value={qty} size={size === "sm" ? "sm" : "md"} onChange={(n) => cart.setQty(product.id, n)} />
        <Link href="/cart" className={buttonClass("dark", size === "lg" ? "md" : size, "flex-1 px-3")} aria-label={t("product.goToCart")}>
          <Icon name="check" className="size-4" strokeWidth={2.5} />
          <span className="truncate">{t("product.inCart")}</span>
        </Link>
      </div>
    );
  }

  return (
    <Button size={size} className={cn("w-full", className)} onClick={() => cart.add(product.id, 1, { name: product.name })}>
      <Icon name="cart" className="size-[18px]" />
      {t("product.addToCart")}
    </Button>
  );
}
