import type { Metadata } from "next";
import { t } from "@/i18n";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: t("checkout.title"), robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
