import type { Metadata } from "next";
import { api } from "@/lib/api/server";
import { t } from "@/i18n";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { hasFilters, parseCatalogParams } from "@/components/catalog/params";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">): Promise<Metadata> {
  const q = parseCatalogParams(await searchParams);
  return {
    title: t("catalog.title"),
    description: t("catalog.metaDescription"),
    alternates: { canonical: "/catalog" },
    robots: hasFilters(q) || (q.page ?? 1) > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const params = await searchParams;
  const query = parseCatalogParams(params);
  const categories = await api.soft(api.categories(), []);
  return (
    <>
      {categories.length > 0 && !hasFilters(query) && (query.page ?? 1) === 1 && (
        <section className="container-page pt-8 lg:hidden">
          <CategoryTiles categories={categories} />
        </section>
      )}
      <CatalogView
        title={t("catalog.title")}
        crumbs={[{ name: t("common.home"), href: "/" }, { name: t("catalog.title") }]}
        query={query}
        basePath="/catalog"
        params={params}
        subcategories={categories}
      />
    </>
  );
}
