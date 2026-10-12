"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchByIds, qk } from "@/lib/api/queries";
import { formatPrice } from "@/lib/format";
import { useCompare, useHydrated } from "@/stores/local";
import { t } from "@/i18n";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageTitle, StockBadge } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductImage } from "@/components/product/ProductImage";
import { AddToCartButton } from "@/components/product/ProductActions";

export function CompareClient() {
  const { ids, remove, clear } = useCompare();
  const hydrated = useHydrated((s) => s.done);
  const q = useQuery({ queryKey: qk.byIds(ids), queryFn: () => fetchByIds(ids), enabled: hydrated && ids.length > 0 });
  const items = q.data ?? [];
  return (
    <div className="container-page pt-8">
      <div className="flex items-start justify-between gap-4">
        <PageTitle>{t("compare.title")}</PageTitle>
        {ids.length > 0 && <Button variant="ghost" size="sm" onClick={clear}>{t("compare.clear")}</Button>}
      </div>
      {!hydrated || (ids.length > 0 && q.isPending) ? (
        <Skeleton className="h-80" />
      ) : !items.length ? (
        <EmptyState icon="compare" title={t("compare.empty")} text={t("compare.emptyText")} action={<ButtonLink href="/catalog">{t("cart.toCatalog")}</ButtonLink>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                {items.map((p) => (
                  <th key={p.id} scope="col" className="w-1/4 p-4 align-top font-normal">
                    <ProductImage image={p.image} alt={p.name} className="aspect-square rounded-lg" sizes="200px" />
                    <Link href={`/product/${p.slug}`} className="mt-3 line-clamp-2 font-medium hover:text-brand-text">{p.name}</Link>
                    <button type="button" onClick={() => remove(p.id)} className="mt-1 text-xs text-muted hover:text-danger">{t("compare.remove")}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>{items.map((p) => <td key={p.id} className="p-4"><span className="text-xs text-muted">{t("compare.price")}</span><p className="text-lg font-bold tabular">{formatPrice(p.price_minor)}</p></td>)}</tr>
              <tr>{items.map((p) => <td key={p.id} className="p-4"><span className="text-xs text-muted">{t("compare.brand")}</span><p>{p.brand?.name ?? "—"}</p></td>)}</tr>
              <tr>{items.map((p) => <td key={p.id} className="p-4"><span className="text-xs text-muted">{t("compare.availability")}</span><p><StockBadge level={p.stock_level} /></p></td>)}</tr>
              <tr>{items.map((p) => <td key={p.id} className="p-4"><AddToCartButton product={p} size="sm" /></td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
