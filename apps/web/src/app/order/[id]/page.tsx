import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@/i18n";
import { OrderClient } from "./OrderClient";

export const metadata: Metadata = { title: t("order.successTitle"), robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderClient id={id} />
    </Suspense>
  );
}
