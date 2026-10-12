import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@/i18n";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: t("auth.loginTitle"), robots: { index: false } };

export default function LoginPage() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
