"use client";

import Link from "next/link";
import type { CartLine } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { StockBadge } from "@/components/ui/misc";
import { ProductImage } from "@/components/product/ProductImage";
import { QtyStepper } from "@/components/product/ProductActions";

export function CartLines({ lines, onQty, onRemove, compact }: { lines: CartLine[]; onQty?: (id: number, q: number) => void; onRemove?: (id: number) => void; compact?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => {
        const p = l.product;
        return (
          <li key={p.id} className={cn("flex gap-4", compact ? "py-3" : "py-5")}>
            <Link href={`/product/${p.slug}`} className="shrink-0">
              <ProductImage image={p.image} alt={p.name} className={cn("rounded-lg border border-line", compact ? "size-16" : "size-24 sm:size-28")} sizes="112px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.slug}`} className={cn("line-clamp-2 font-medium hover:text-brand-text", compact ? "text-sm" : "text-[15px]")}>{p.name}</Link>
                  {!compact && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] text-muted">
                      {p.sku && <span>{t("common.sku")} {p.sku}</span>}
                      <StockBadge level={p.stock_level} />
                    </div>
                  )}
                  {!l.available && <p className="mt-1 text-[13px] font-medium text-danger">{t("cart.unavailable")}</p>}
                  {compact && <p className="mt-1 text-[13px] text-muted tabular">{l.quantity} × {formatPrice(p.price_minor)}</p>}
                </div>
                <div className="text-right">
                  <p className={cn("font-bold tabular", compact ? "text-sm" : "text-lg")}>{formatPrice(l.line_total_minor)}</p>
                  {!compact && l.quantity > 1 && <p className="text-xs text-muted tabular">{t("cart.perUnit", { price: formatPrice(p.price_minor) })}</p>}
                </div>
              </div>
              {onQty && onRemove && (
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <QtyStepper value={l.quantity} size="sm" onChange={(n) => (n <= 0 ? onRemove(p.id) : onQty(p.id, n))} />
                  <button type="button" onClick={() => onRemove(p.id)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-danger-soft hover:text-danger" aria-label={t("cart.removeItem", { name: p.name })}>
                    <Icon name="trash" className="size-4" />
                    <span className="hidden sm:inline">{t("cart.remove")}</span>
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
