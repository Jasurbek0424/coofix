"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useSessionActions } from "@/hooks/useSession";
import { apiFetch } from "@/lib/api/client";
import { qk } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/shared";
import type { Order, Page, User } from "@/lib/api/types";
import { formatDate, formatPhone, formatPrice, normalizePhone } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/cn";
import { errorMessage, t, tp } from "@/i18n";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Alert, EmptyState, PageTitle } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/Skeleton";

type Tab = "profile" | "orders" | "password";

export function AccountClient() {
  const { status, user } = useAuth();
  const router = useRouter();
  const actions = useSessionActions();
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/account");
  }, [status, router]);

  if (!user) return <div className="container-page space-y-4 pt-10"><Skeleton className="h-10 w-72" /><Skeleton className="h-64" /></div>;

  return (
    <div className="container-page pt-8">
      <PageTitle sub={t("account.memberSince", { date: formatDate(user.created_at) })}>{t("account.greeting", { name: user.first_name })}</PageTitle>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label={t("account.title")} className="flex gap-2 overflow-x-auto lg:flex-col">
          {(["orders", "profile", "password"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setTab(k)} aria-current={tab === k ? "page" : undefined}
              className={cn("shrink-0 rounded-lg px-4 py-2.5 text-left text-[15px] font-medium transition-colors", tab === k ? "bg-ink text-bg" : "hover:bg-surface-3")}>
              {t(`account.tabs.${k}`)}
            </button>
          ))}
          <button type="button" onClick={async () => { await actions.logout(); router.replace("/"); }} className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[15px] text-muted hover:bg-danger-soft hover:text-danger">
            <Icon name="logout" className="size-4" />{t("auth.logout")}
          </button>
        </nav>
        <div className="min-w-0">
          {tab === "orders" && <Orders />}
          {tab === "profile" && <Profile user={user} />}
          {tab === "password" && <Password />}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const q = useInfiniteQuery({
    queryKey: qk.myOrders,
    queryFn: ({ pageParam }) => apiFetch<Page<Order>>(`/orders/my?page=${pageParam}&per_page=10`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.per_page < last.total ? last.page + 1 : undefined),
  });
  if (q.isPending) return <Skeleton className="h-48" />;
  if (q.isError) return <Alert tone="danger">{errorMessage(q.error instanceof ApiError ? q.error.code : undefined)}</Alert>;
  const orders = q.data.pages.flatMap((p) => p.items);
  if (!orders.length) return <EmptyState icon="package" title={t("account.ordersEmpty")} text={t("account.ordersEmptyText")} action={<ButtonLink href="/catalog">{t("cart.toCatalog")}</ButtonLink>} />;
  return (
    <section>
      <h2 className="sr-only">{t("account.ordersTitle")}</h2>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/order/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
              <div>
                <p className="font-semibold">{t("order.title", { n: o.number })}</p>
                <p className="text-sm text-muted">{formatDate(o.created_at)} · {tp("cart.items", o.items.reduce((n, i) => n + i.quantity, 0))}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", o.status === "cancelled" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand-text")}>{t(`order.statuses.${o.status}`)}</span>
              <span className="text-lg font-bold tabular">{formatPrice(o.total_minor)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {q.hasNextPage && <Button variant="outline" className="mt-4" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>{t("account.loadMore")}</Button>}
    </section>
  );
}

const profileSchema = z.object({
  first_name: z.string().trim().min(1, t("validation.required")).max(80),
  last_name: z.string().trim().max(80),
  phone: z.string().refine((v) => !v || /^7\d{10}$/.test(v.replace(/\D/g, "")), t("validation.phone")),
});

function Profile({ user }: { user: User }) {
  const actions = useSessionActions();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState, control } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user.first_name, last_name: user.last_name ?? "", phone: user.phone ? formatPhone(user.phone) : "" },
  });
  return (
    <form
      noValidate
      className="max-w-xl space-y-4 rounded-2xl border border-line bg-surface p-6"
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        try {
          const u = await apiFetch<User>("/auth/me", { method: "PATCH", body: { first_name: v.first_name, last_name: v.last_name || null, phone: v.phone ? normalizePhone(v.phone) : null } });
          actions.setUser(u);
          toast({ title: t("account.profileSaved") });
        } catch (e) {
          setError(errorMessage(e instanceof ApiError ? e.code : "network"));
        }
      })}
    >
      <h2 className="text-lg font-semibold">{t("account.profileTitle")}</h2>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("auth.firstName")} error={formState.errors.first_name?.message}>{(a) => <Input {...a} {...register("first_name")} />}</Field>
        <Field label={t("auth.lastName")} error={formState.errors.last_name?.message}>{(a) => <Input {...a} {...register("last_name")} />}</Field>
      </div>
      <Field label={t("auth.email")} hint={t("account.emailReadonly")}>{(a) => <Input {...a} value={user.email} readOnly disabled />}</Field>
      <Field label={t("auth.phone")} error={formState.errors.phone?.message}>
        {(a) => <Controller control={control} name="phone" render={({ field }) => <Input {...a} type="tel" value={field.value} ref={field.ref} onBlur={field.onBlur} onChange={(e) => field.onChange(formatPhone(e.target.value))} />} />}
      </Field>
      <Button type="submit" loading={formState.isSubmitting}>{t("common.save")}</Button>
    </form>
  );
}

const pwSchema = z.object({
  current_password: z.string().min(1, t("validation.required")).max(128),
  new_password: z.string().min(8, t("validation.passwordMin")).max(128),
});

function Password() {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema), defaultValues: { current_password: "", new_password: "" } });
  return (
    <form
      noValidate
      className="max-w-xl space-y-4 rounded-2xl border border-line bg-surface p-6"
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        try {
          await apiFetch<void>("/auth/change-password", { method: "POST", body: v });
          reset();
          toast({ title: t("account.passwordChanged") });
        } catch (e) {
          setError(errorMessage(e instanceof ApiError ? e.code : "network"));
        }
      })}
    >
      <h2 className="text-lg font-semibold">{t("account.passwordTitle")}</h2>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label={t("account.currentPassword")} error={formState.errors.current_password?.message}>{(a) => <Input {...a} type="password" autoComplete="current-password" {...register("current_password")} />}</Field>
      <Field label={t("account.newPassword")} hint={t("auth.passwordHint")} error={formState.errors.new_password?.message}>{(a) => <Input {...a} type="password" autoComplete="new-password" {...register("new_password")} />}</Field>
      <Button type="submit" loading={formState.isSubmitting}>{t("common.save")}</Button>
    </form>
  );
}
