"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { qk } from "@/lib/api/queries";
import { ApiError, toQuery } from "@/lib/api/shared";
import type { OrderDetail, OrderStatus } from "@/lib/api/types";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/cn";
import { errorMessage, t } from "@/i18n";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/Skeleton";

const STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export function OrderClient({ id }: { id: string }) {
  const sp = useSearchParams();
  const token = sp.get("token") ?? undefined;
  const isNew = sp.get("new") === "1";
  const status = useAuth((s) => s.status);
  const qc = useQueryClient();
  const q = toQuery({ token });

  const order = useQuery({
    queryKey: qk.order(id),
    queryFn: () => apiFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}${q}`),
    enabled: Boolean(token) || status !== "loading",
    retry: false,
  });

  const cancel = useMutation({
    mutationFn: () => apiFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}/cancel${q}`, { method: "POST" }),
    onSuccess: (o) => {
      qc.setQueryData(qk.order(id), o);
      toast({ title: t("order.cancelled") });
    },
    onError: (e) => toast({ title: errorMessage(e instanceof ApiError ? e.code : undefined), tone: "danger" }),
  });

  if (order.isPending) return <div className="container-page space-y-4 pt-10"><Skeleton className="h-12 w-80" /><Skeleton className="h-72" /></div>;
  if (order.isError || !order.data) {
    return (
      <div className="container-page pt-10">
        <EmptyState icon="package" title={t("order.notFoundTitle")} text={t("order.notFoundText")} action={<ButtonLink href="/">{t("errors.toHome")}</ButtonLink>} />
      </div>
    );
  }
  const o = order.data;
  const step = STEPS.indexOf(o.status);

  return (
    <div className="container-page max-w-4xl pt-8">
      {isNew && o.status === "pending" && (
        <div className="mb-8 flex flex-col items-center rounded-2xl bg-coal px-6 py-10 text-center text-white">
          <span className="grid size-16 place-items-center rounded-full bg-brand text-coal animate-pop"><Icon name="check" className="size-8" strokeWidth={2.5} /></span>
          <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{t("order.successTitle")}</h1>
          <p className="mt-3 max-w-lg text-white/70">{t("order.successText")}</p>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {isNew ? <h2 className="font-display text-2xl font-bold">{t("order.title", { n: o.number })}</h2> : <h1 className="font-display text-2xl font-bold sm:text-3xl">{t("order.title", { n: o.number })}</h1>}
          <p className="mt-1 text-sm text-muted">{t("order.createdAt", { date: formatDate(o.created_at) })}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", o.status === "cancelled" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand-text")}>
          {t(`order.statuses.${o.status}`)}
        </span>
      </div>

      {o.status !== "cancelled" && (
        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label={t("order.status")}>
          {STEPS.map((s, i) => (
            <li key={s} className="text-xs">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-surface-3")} />
              <p className={cn("mt-2", i <= step ? "font-semibold text-ink" : "text-muted")} aria-current={i === step ? "step" : undefined}>{t(`order.statuses.${s}`)}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-semibold">{t("order.items")}</h2>
          <ul className="mt-3 divide-y divide-line">
            {o.items.map((it, i) => (
              <li key={`${it.product_id}-${i}`} className="flex justify-between gap-4 py-3 text-[15px]">
                <span className="min-w-0">
                  <span className="block">{it.name}</span>
                  <span className="text-[13px] text-muted tabular">{t("order.qty", { n: it.quantity })} × {formatPrice(it.unit_price_minor)}</span>
                </span>
                <span className="shrink-0 font-semibold tabular">{formatPrice(it.line_total_minor)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">{t("order.subtotal")}</dt><dd className="tabular">{formatPrice(o.subtotal_minor)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("order.delivery")}</dt><dd className="tabular">{o.delivery_minor ? formatPrice(o.delivery_minor) : t("order.free")}</dd></div>
            <div className="flex justify-between text-lg font-bold"><dt>{t("order.total")}</dt><dd className="tabular">{formatPrice(o.total_minor)}</dd></div>
          </dl>
        </section>
        <aside className="space-y-4">
          <dl className="space-y-3 rounded-2xl border border-line bg-surface p-5 text-sm">
            <div><dt className="text-muted">{t("order.customer")}</dt><dd className="font-medium">{o.customer_name}, {o.phone}</dd></div>
            <div><dt className="text-muted">{t("order.deliveryMethod")}</dt><dd className="font-medium">{t(`checkout.${o.delivery_method}`)}</dd></div>
            {o.address && <div><dt className="text-muted">{t("order.address")}</dt><dd className="font-medium">{o.address}</dd></div>}
            <div><dt className="text-muted">{t("order.paymentMethod")}</dt><dd className="font-medium">{t(`checkout.payments.${o.payment_method}.title`)} · {t(`order.paymentStatuses.${o.payment_status}`)}</dd></div>
            {o.comment && <div><dt className="text-muted">{t("order.comment")}</dt><dd>{o.comment}</dd></div>}
          </dl>
          {o.events.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5 text-sm">
              <p className="font-semibold">{t("order.history")}</p>
              <ul className="mt-2 space-y-1.5 text-muted">
                {o.events.map((e, i) => (
                  <li key={i}>{formatDateTime(e.created_at)} — {e.to_status in { pending: 1, confirmed: 1, shipped: 1, delivered: 1, cancelled: 1 } ? t(`order.statuses.${e.to_status as OrderStatus}`) : e.to_status}</li>
                ))}
              </ul>
            </div>
          )}
          {o.status === "pending" && (
            <Button variant="danger" className="w-full" loading={cancel.isPending} onClick={() => window.confirm(t("order.cancelConfirm")) && cancel.mutate()}>
              {t("order.cancel")}
            </Button>
          )}
          {token && (
            <Button variant="outline" className="w-full" onClick={() => navigator.clipboard?.writeText(window.location.href.replace("&new=1", "")).then(() => toast({ title: t("order.copied") }))}>
              <Icon name="copy" className="size-4" />{t("order.copyLink")}
            </Button>
          )}
          <ButtonLink href="/catalog" variant="ghost" className="w-full">{t("order.toCatalog")}</ButtonLink>
        </aside>
      </div>
    </div>
  );
}
