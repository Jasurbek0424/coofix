"use client";

import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import { t, tp } from "@/i18n";
import { ButtonLink } from "@/components/ui/Button";
import { Alert, Breadcrumbs, EmptyState, PageTitle } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartLines } from "@/components/cart/CartLines";

export function CartClient() {
  const cart = useCart();
  return (
    <div className="container-page pt-5 sm:pt-8">
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("cart.title") }]} />
      <PageTitle className="mt-4" sub={cart.ready && cart.lines.length ? tp("cart.items", cart.count) : undefined}>{t("cart.title")}</PageTitle>
      {!cart.ready ? (
        <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      ) : !cart.lines.length ? (
        <EmptyState icon="cart" title={t("cart.empty")} text={t("cart.emptyText")} action={<ButtonLink href="/catalog">{t("cart.toCatalog")}</ButtonLink>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          <div className="rounded-2xl border border-line bg-surface px-4 sm:px-6">
            <CartLines lines={cart.lines} onQty={cart.setQty} onRemove={cart.remove} />
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-lg font-semibold">{t("cart.summary")}</h2>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div className="flex justify-between gap-4"><dt className="text-muted">{t("cart.subtotal")}</dt><dd className="font-medium tabular">{formatPrice(cart.subtotal)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">{t("cart.delivery")}</dt><dd className="text-right text-sm text-muted">{t("cart.deliveryCalc")}</dd></div>
                <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold"><dt>{t("cart.total")}</dt><dd className="tabular">{formatPrice(cart.subtotal)}</dd></div>
              </dl>
              {cart.hasUnavailable && <Alert tone="warning" className="mt-4">{t("cart.unavailableHint")}</Alert>}
              <ButtonLink href="/checkout" size="lg" className="mt-6 w-full" aria-disabled={cart.hasUnavailable || undefined}>
                {t("cart.checkout")}
              </ButtonLink>
              <ButtonLink href="/catalog" variant="ghost" className="mt-2 w-full">{t("cart.continueShopping")}</ButtonLink>
              {!cart.isUser && <p className="mt-4 text-center text-[13px] text-muted">{t("cart.loginHint")}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
