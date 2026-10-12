"use client";

import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchByIds, qk } from "@/lib/api/queries";
import { useHydrated } from "@/stores/local";
import { t } from "@/i18n";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageTitle } from "@/components/ui/misc";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { ProductGrid } from "@/components/product/ProductCard";

export function FavoritesClient() {
  const fav = useFavorites();
  const hydrated = useHydrated((s) => s.done);
  const ids = [...fav.ids];
  const guest = useQuery({ queryKey: qk.byIds(ids), queryFn: () => fetchByIds(ids), enabled: !fav.isUser && hydrated && ids.length > 0 });
  const items = fav.isUser ? fav.serverItems : ids.length ? guest.data : [];
  return (
    <div className="container-page pt-8">
      <PageTitle>{t("favorites.title")}</PageTitle>
      {!hydrated || !items ? (
        <GridSkeleton count={4} />
      ) : items.length ? (
        <ProductGrid products={items} />
      ) : (
        <EmptyState icon="heart" title={t("favorites.empty")} text={t("favorites.emptyText")} action={<ButtonLink href="/catalog">{t("cart.toCatalog")}</ButtonLink>} />
      )}
    </div>
  );
}
