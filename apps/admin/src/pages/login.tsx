import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "@/api/client";
import { FormField } from "@/components/common/form-field";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().min(1, t.validation.required).email(t.validation.email),
  password: z.string().min(1, t.validation.required).max(128),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      await login(v.email, v.password);
    } catch (e) {
      setError(e instanceof ApiError ? e.userMessage : t.errors.generic);
      form.setValue("password", "");
      form.setFocus("password");
    }
  });

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary),transparent_85%),transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">
        <Logo className="mb-6 justify-center" />
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold">{t.auth.title}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{t.auth.subtitle}</p>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4" noValidate>
            {error && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-[13px] text-destructive">
                {error}
              </div>
            )}
            <FormField label={t.auth.email} error={errors.email?.message}>
              <Input type="email" autoComplete="username" autoFocus {...form.register("email")} />
            </FormField>
            <FormField label={t.auth.password} error={errors.password?.message}>
              <Input type="password" autoComplete="current-password" {...form.register("password")} />
            </FormField>
            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {isSubmitting ? t.auth.submitting : t.auth.submit}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
