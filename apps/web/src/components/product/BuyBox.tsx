"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useHydrated } from "@/stores/local";
import type { ProductCard } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { t } from "@/i18n";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CompareButton, FavoriteButton, QtyStepper } from "./ProductActions";

export function BuyBox({ product }: { product: ProductCard }) {
  const cart = useCart();
  const hydrated = useHydrated((s) => s.done);
  const [qty, setQty] = useState(1);
  const inCart = hydrated ? cart.quantityOf(product.id) : 0;
  const out = product.stock_level === "out";

  const add = () => cart.add(product.id, qty, { name: product.name });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {!out && <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} />}
        {out ? (
          <Button variant="soft" size="lg" disabled className="flex-1">{t("product.outOfStock")}</Button>
        ) : (
          <Button size="lg" className="min-w-48 flex-1" onClick={add}>
            <Icon name="cart" className="size-5" />
            {t("product.addToCart")}
          </Button>
        )}
      </div>
      {inCart > 0 && (
        <Link href="/cart" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-success hover:underline">
          <Icon name="check" className="size-4" strokeWidth={2.5} />
          {t("product.inCart")}: {inCart} · {t("product.goToCart")}
        </Link>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <FavoriteButton product={product} withLabel />
        <CompareButton productId={product.id} withLabel />
      </div>

      {/* Sticky mobile bar above the tab bar */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight tabular">{formatPrice(product.price_minor)}</p>
            {product.old_price_minor && product.old_price_minor > product.price_minor && (
              <s className="text-xs text-muted tabular">{formatPrice(product.old_price_minor)}</s>
            )}
          </div>
          {out ? (
            <Button variant="soft" disabled>{t("product.outOfStock")}</Button>
          ) : inCart > 0 ? (
            <Link href="/cart" className={buttonClass("dark", "md")}>{t("product.goToCart")}</Link>
          ) : (
            <Button onClick={add}>
              <Icon name="cart" className="size-5" />
              {t("product.addToCart")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
