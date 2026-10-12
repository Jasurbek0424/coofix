import type { Metadata } from "next";
import { t } from "@/i18n";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = { title: t("account.title"), robots: { index: false } };

export default function AccountPage() {
  return <AccountClient />;
}
