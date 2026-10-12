"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useSessionActions } from "@/hooks/useSession";
import { ApiError } from "@/lib/api/shared";
import { formatPhone, normalizePhone } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { errorMessage, t } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/misc";
import { HexMark } from "@/components/ui/Logo";

const loginSchema = z.object({
  email: z.email(t("validation.email")),
  password: z.string().min(1, t("validation.required")).max(128),
});
const registerSchema = z.object({
  first_name: z.string().trim().min(1, t("validation.required")).max(80, t("validation.max")),
  last_name: z.string().trim().max(80, t("validation.max")),
  email: z.email(t("validation.email")),
  phone: z.string().refine((v) => !v || /^7\d{10}$/.test(v.replace(/\D/g, "")), t("validation.phone")),
  password: z.string().min(8, t("validation.passwordMin")).max(128),
});
type RegisterForm = z.infer<typeof registerSchema>;

export function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const actions = useSessionActions();
  const status = useAuth((s) => s.status);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const form = useForm<RegisterForm>({
    resolver: zodResolver((isLogin ? loginSchema : registerSchema) as typeof registerSchema),
    defaultValues: { first_name: "", last_name: "", email: "", phone: "", password: "" },
  });
  const { register, handleSubmit, formState, control } = form;
  const e = formState.errors;

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      if (isLogin) await actions.login(v.email, v.password);
      else
        await actions.register({
          email: v.email,
          password: v.password,
          first_name: v.first_name.trim(),
          last_name: v.last_name.trim() || null,
          phone: v.phone ? normalizePhone(v.phone) : null,
        });
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err instanceof ApiError ? err.code : "network"));
    }
  });

  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-md sm:p-8">
        <HexMark className="size-12" />
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">{isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}</h1>
        <p className="mt-2 text-[15px] text-muted">{isLogin ? t("auth.loginText") : t("auth.registerText")}</p>
        {error && <Alert tone="danger" className="mt-5">{error}</Alert>}
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {!isLogin && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("auth.firstName")} error={e.first_name?.message}>{(a) => <Input {...a} autoComplete="given-name" {...register("first_name")} />}</Field>
              <Field label={t("auth.lastName")} optional={t("common.optional")} error={e.last_name?.message}>{(a) => <Input {...a} autoComplete="family-name" {...register("last_name")} />}</Field>
            </div>
          )}
          <Field label={t("auth.email")} error={e.email?.message}>{(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}</Field>
          {!isLogin && (
            <Field label={t("auth.phone")} optional={t("common.optional")} error={e.phone?.message}>
              {(a) => (
                <Controller control={control} name="phone" render={({ field }) => (
                  <Input {...a} type="tel" inputMode="tel" autoComplete="tel" placeholder={t("checkout.phonePlaceholder")} value={field.value} ref={field.ref} onBlur={field.onBlur} onChange={(ev) => field.onChange(formatPhone(ev.target.value))} />
                )} />
              )}
            </Field>
          )}
          <Field label={t("auth.password")} hint={isLogin ? undefined : t("auth.passwordHint")} error={e.password?.message}>
            {(a) => (
              <div className="relative">
                <Input {...a} type={show ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} className="pr-12" {...register("password")} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")} aria-pressed={show} className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-muted hover:text-ink">
                  <Icon name={show ? "eyeOff" : "eye"} className="size-5" />
                </button>
              </div>
            )}
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
            {formState.isSubmitting ? t("auth.submitting") : isLogin ? t("auth.submitLogin") : t("auth.submitRegister")}
          </Button>
          {!isLogin && (
            <p className="text-center text-xs text-muted">{t("auth.agree")} <Link href="/privacy" className="underline">{t("auth.agreeLink")}</Link></p>
          )}
        </form>
        <p className="mt-6 border-t border-line pt-5 text-center text-[15px] text-muted">
          {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <Link href={`${isLogin ? "/register" : "/login"}${sp.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-text hover:underline">
            {isLogin ? t("auth.toRegister") : t("auth.toLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
