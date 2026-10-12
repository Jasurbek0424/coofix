import type { Metadata } from "next";
import { t } from "@/i18n";
import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = { title: t("favorites.title"), robots: { index: false } };

export default function FavoritesPage() {
  return <FavoritesClient />;
}
