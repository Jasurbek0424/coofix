import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@/i18n";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: t("auth.registerTitle"), robots: { index: false } };

export default function RegisterPage() {
  return <Suspense><AuthForm mode="register" /></Suspense>;
}
