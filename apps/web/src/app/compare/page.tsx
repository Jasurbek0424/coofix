import type { Metadata } from "next";
import { t } from "@/i18n";
import { CompareClient } from "./CompareClient";

export const metadata: Metadata = { title: t("compare.title"), robots: { index: false } };

export default function ComparePage() {
  return <CompareClient />;
}
