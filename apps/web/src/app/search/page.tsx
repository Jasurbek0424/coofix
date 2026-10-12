import type { Metadata } from "next";
import { t } from "@/i18n";
import { CatalogView } from "@/components/catalog/CatalogView";
import { parseCatalogParams } from "@/components/catalog/params";
import { EmptyState } from "@/components/ui/misc";

export const metadata: Metadata = { title: t("search.title"), robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = parseCatalogParams(params);
  if (!query.q) {
    return (
      <div className="container-page pt-10">
        <EmptyState icon="search" title={t("search.title")} text={t("search.prompt")} />
      </div>
    );
  }
  return (
    <CatalogView
      title={t("search.resultsFor", { q: query.q })}
      crumbs={[{ name: t("common.home"), href: "/" }, { name: t("search.title") }]}
      query={query}
      basePath="/search"
      params={params}
      emptyTitle={t("search.emptyTitle", { q: query.q })}
      emptyText={t("search.emptyText")}
    />
  );
}
