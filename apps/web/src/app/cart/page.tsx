import type { Metadata } from "next";
import { t } from "@/i18n";
import { CartClient } from "./CartClient";

export const metadata: Metadata = { title: t("cart.title"), robots: { index: false } };

export default function CartPage() {
  return <CartClient />;
}
