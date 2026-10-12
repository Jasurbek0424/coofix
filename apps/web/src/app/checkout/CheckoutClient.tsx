"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useCart } from "@/hooks/useCart";
import { apiFetch } from "@/lib/api/client";
import { qk } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/shared";
import type { CheckoutIn, CheckoutOut, StockProblem } from "@/lib/api/types";
import { formatPhone, formatPrice, normalizePhone } from "@/lib/format";
import { PASS_PHONE } from "@/lib/site";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/cn";
import { errorMessage, t, tx } from "@/i18n";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Alert, Breadcrumbs, EmptyState, PageTitle } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartLines } from "@/components/cart/CartLines";

const PAYMENTS = ["cash_on_delivery", "card_on_delivery", "invoice"] as const;

const schema = z
  .object({
    customer_name: z.string().trim().min(2, t("validation.nameMin")).max(160, t("validation.max")),
    phone: z.string().refine((v) => /^7\d{10}$/.test(v.replace(/\D/g, "")), t("validation.phone")),
    email: z.union([z.literal(""), z.email(t("validation.email"))]),
    delivery_method: z.enum(["pickup", "courier"]),
    address: z.string().max(500, t("validation.max")),
    payment_method: z.enum(PAYMENTS),
    comment: z.string().max(1000, t("validation.max")),
  })
  .superRefine((v, ctx) => {
    if (v.delivery_method === "courier" && !v.address.trim()) {
      ctx.addIssue({ code: "custom", path: ["address"], message: t("validation.addressRequired") });
    }
  });

type Form = z.infer<typeof schema>;

export function CheckoutClient() {
  const cart = useCart();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const [stockProblems, setStockProblems] = useState<StockProblem[] | null>(null);
  const [priceTotal, setPriceTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, control, formState, reset, getValues } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { customer_name: "", phone: "", email: "", delivery_method: "pickup", address: "", payment_method: "cash_on_delivery", comment: "" },
  });
  const delivery = useWatch({ control, name: "delivery_method" });

  // Prefill contact details for signed-in users.
  useEffect(() => {
    if (!user) return;
    const v = getValues();
    reset({
      ...v,
      customer_name: v.customer_name || [user.first_name, user.last_name].filter(Boolean).join(" "),
      phone: v.phone || (user.phone ? formatPhone(user.phone) : ""),
      email: v.email || user.email,
    });
  }, [user, reset, getValues]);

  const available = cart.lines.filter((l) => l.available);

  const submit = async (form: Form, expected?: number) => {
    setError(null);
    setStockProblems(null);
    const body: CheckoutIn = {
      items: available.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      customer_name: form.customer_name.trim(),
      phone: normalizePhone(form.phone),
      email: form.email || null,
      delivery_method: form.delivery_method,
      address: form.delivery_method === "courier" ? form.address.trim() : null,
      payment_method: form.payment_method,
      comment: form.comment.trim() || null,
      expected_total_minor: expected ?? cart.subtotal,
    };
    try {
      const res = await apiFetch<CheckoutOut>("/orders", { method: "POST", body });
      setDone(true);
      if (!cart.isUser) cart.clearGuest();
      await qc.invalidateQueries({ queryKey: qk.cart });
      router.push(`/order/${res.order.id}?token=${encodeURIComponent(res.access_token)}&new=1`);
    } catch (e) {
      if (e instanceof ApiError && e.code === "stock_conflict") setStockProblems(e.body?.items ?? []);
      else if (e instanceof ApiError && e.code === "price_changed" && typeof e.body?.total_minor === "number") setPriceTotal(e.body.total_minor);
      else setError(errorMessage(e instanceof ApiError ? e.code : "network"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fixCart = () => {
    stockProblems?.forEach((p) => (p.available > 0 ? cart.setQty(p.product_id, p.available) : cart.remove(p.product_id)));
    setStockProblems(null);
  };

  if (!cart.ready || done) {
    return <div className="container-page space-y-4 pt-10"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>;
  }
  if (!available.length) {
    return (
      <div className="container-page pt-10">
        <EmptyState icon="cart" title={t("checkout.emptyTitle")} text={t("checkout.emptyText")} action={<ButtonLink href="/catalog">{t("cart.toCatalog")}</ButtonLink>} />
      </div>
    );
  }

  const nameOf = (id: number) => cart.lines.find((l) => l.product.id === id)?.product.name ?? `#${id}`;

  return (
    <div className="container-page pt-5 sm:pt-8">
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: t("cart.title"), href: "/cart" }, { name: t("checkout.title") }]} />
      <PageTitle className="mt-4">{t("checkout.title")}</PageTitle>

      {stockProblems && (
        <Alert tone="danger" title={t("checkout.stockConflictTitle")} className="mb-6">
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {stockProblems.map((p) => (
              <li key={p.product_id}>
                {nameOf(p.product_id)} — {p.reason === "unavailable" || p.available <= 0 ? t("checkout.stockUnavailable") : t("checkout.stockInsufficient", { n: p.available })}
              </li>
            ))}
          </ul>
          <Button size="sm" variant="dark" className="mt-3" onClick={fixCart}>{t("checkout.fixCart")}</Button>
        </Alert>
      )}
      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}
      {!user && (
        <p className="mb-6 text-[15px] text-muted">
          {t("checkout.loginPrompt")} <Link href="/login?next=/checkout" className="font-semibold text-brand-text hover:underline">{t("checkout.loginLink")}</Link> {t("checkout.loginSuffix")}
        </p>
      )}

      <form onSubmit={handleSubmit((f) => submit(f))} noValidate className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
        <div className="space-y-6">
          <Section n={1} title={t("checkout.contacts")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("checkout.name")} error={formState.errors.customer_name?.message} className="sm:col-span-2">
                {(a) => <Input {...a} {...register("customer_name")} autoComplete="name" placeholder={t("checkout.namePlaceholder")} />}
              </Field>
              <Field label={t("checkout.phone")} error={formState.errors.phone?.message}>
                {(a) => (
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <Input {...a} type="tel" inputMode="tel" autoComplete="tel" placeholder={t("checkout.phonePlaceholder")} value={field.value} onBlur={field.onBlur} ref={field.ref} onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                    )}
                  />
                )}
              </Field>
              <Field label={t("checkout.email")} optional={t("common.optional")} hint={t("checkout.emailHint")} error={formState.errors.email?.message}>
                {(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}
              </Field>
            </div>
          </Section>

          <Section n={2} title={t("checkout.delivery")}>
            <div role="radiogroup" aria-label={t("checkout.delivery")} className="grid gap-3 sm:grid-cols-2">
              {(["pickup", "courier"] as const).map((m) => (
                <RadioCard key={m} {...register("delivery_method")} value={m} icon={m === "pickup" ? "store" : "truck"} title={t(`checkout.${m}`)} text={t(m === "pickup" ? "checkout.pickupText" : "checkout.courierText")} />
              ))}
            </div>
            {delivery === "pickup" ? (
              <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
                <p className="font-semibold">{t("checkout.pickupPoints")}</p>
                <ul className="mt-2 space-y-2 text-ink-2">
                  {tx("company.pickupPoints").map((p) => (
                    <li key={p.title} className="flex gap-2"><Icon name="mapPin" className="mt-0.5 size-4 shrink-0 text-brand-text" /><span><b className="font-medium text-ink">{p.title}</b> — {p.address}</span></li>
                  ))}
                </ul>
                <p className="mt-3 text-muted">{t("company.passNote")} {t("company.passPhone")}: <a href={PASS_PHONE.href} className="font-semibold text-ink">{PASS_PHONE.display}</a></p>
              </div>
            ) : (
              <Field label={t("checkout.address")} error={formState.errors.address?.message} className="mt-4">
                {(a) => <Textarea {...a} {...register("address")} autoComplete="street-address" rows={2} placeholder={t("checkout.addressPlaceholder")} />}
              </Field>
            )}
          </Section>

          <Section n={3} title={t("checkout.payment")}>
            <div role="radiogroup" aria-label={t("checkout.payment")} className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map((m) => (
                <RadioCard key={m} {...register("payment_method")} value={m} icon={m === "invoice" ? "building" : m === "card_on_delivery" ? "tag" : "package"} title={t(`checkout.payments.${m}.title`)} text={t(`checkout.payments.${m}.text`)} />
              ))}
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-line-strong p-4 opacity-60" aria-disabled="true">
                <Icon name="bolt" className="mt-0.5 size-5 text-muted" />
                <div>
                  <p className="font-semibold">{t("checkout.payments.online.title")} <span className="ml-1 rounded bg-surface-3 px-1.5 py-0.5 text-[11px] font-bold uppercase">{t("checkout.soon")}</span></p>
                  <p className="mt-0.5 text-[13px] text-muted">{t("checkout.payments.online.text")}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section n={4} title={t("checkout.comment")}>
            <Field label={t("checkout.comment")} optional={t("common.optional")} error={formState.errors.comment?.message}>
              {(a) => <Textarea {...a} {...register("comment")} rows={3} placeholder={t("checkout.commentPlaceholder")} />}
            </Field>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("checkout.summary")}</h2>
              <Link href="/cart" className="text-sm font-semibold text-brand-text hover:underline">{t("checkout.edit")}</Link>
            </div>
            <div className="mt-2 max-h-72 overflow-y-auto">
              <CartLines lines={available} compact />
            </div>
            <dl className="mt-3 space-y-2.5 border-t border-line pt-4 text-[15px]">
              <div className="flex justify-between"><dt className="text-muted">{t("cart.subtotal")}</dt><dd className="font-medium tabular">{formatPrice(cart.subtotal)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{t("cart.delivery")}</dt><dd className="text-right text-sm">{delivery === "pickup" ? t("checkout.deliveryPickupFree") : t("checkout.deliveryCourier")}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-xl font-bold"><dt>{t("cart.total")}</dt><dd className="tabular">{formatPrice(cart.subtotal)}</dd></div>
            </dl>
            {delivery === "courier" && <p className="mt-2 text-[13px] text-muted">{t("checkout.totalNote")}</p>}
            <Button type="submit" size="lg" className="mt-5 w-full" loading={formState.isSubmitting}>
              {formState.isSubmitting ? t("checkout.submitting") : t("checkout.submit")}
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              {t("checkout.agree")} <Link href="/privacy" className="underline hover:text-ink">{t("checkout.agreeLink")}</Link>
            </p>
          </div>
        </aside>
      </form>

      <Sheet
        open={priceTotal !== null}
        onClose={() => setPriceTotal(null)}
        title={t("checkout.priceChangedTitle")}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              size="lg"
              className="flex-1"
              loading={formState.isSubmitting}
              onClick={handleSubmit(async (f) => {
                const total = priceTotal ?? undefined;
                setPriceTotal(null);
                await submit(f, total);
              })}
            >
              {t("checkout.priceChangedConfirm", { total: formatPrice(priceTotal ?? 0) })}
            </Button>
            <ButtonLink href="/cart" variant="outline" size="lg" className="flex-1">{t("checkout.priceChangedReview")}</ButtonLink>
          </div>
        }
      >
        <p className="p-5 text-[15px] text-ink-2">{t("checkout.priceChangedText", { total: formatPrice(priceTotal ?? 0) })}</p>
      </Sheet>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-ink text-sm font-bold text-bg">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

type RadioProps = React.ComponentProps<"input"> & { title: string; text: string; icon: Parameters<typeof Icon>[0]["name"] };

function RadioCard({ title, text, icon, className, ...input }: RadioProps) {
  return (
    <label className={cn("group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong p-4 transition-colors hover:border-muted has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand", className)}>
      <input type="radio" className="sr-only" {...input} />
      <Icon name={icon} className="mt-0.5 size-5 shrink-0 text-muted group-has-[:checked]:text-brand-text" />
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{text}</span>
      </span>
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-line-strong group-has-[:checked]:border-brand" aria-hidden="true">
        <span className="size-2.5 scale-0 rounded-full bg-brand transition-transform group-has-[:checked]:scale-100" />
      </span>
    </label>
  );
}
