import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api, isNotFound } from "@/lib/api/server";
import { breadcrumbLd } from "@/lib/seo";
import { t } from "@/i18n";
import { CatalogView } from "@/components/catalog/CatalogView";
import { hasFilters, parseCatalogParams } from "@/components/catalog/params";
import { JsonLd } from "@/components/seo/JsonLd";

const getCategory = cache(async (slug: string) => {
  try {
    return await api.category(slug);
  } catch (e) {
    if (isNotFound(e)) notFound();
    throw e;
  }
});

export async function generateMetadata({ params, searchParams }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  const q = parseCatalogParams(await searchParams);
  const description = cat.seo.description || cat.description || t("catalog.metaDescription");
  return {
    title: cat.seo.title || cat.name,
    description,
    alternates: { canonical: `/catalog/${cat.slug}` },
    openGraph: { title: cat.seo.title || cat.name, description, url: `/catalog/${cat.slug}` },
    robots: hasFilters(q) || (q.page ?? 1) > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await getCategory(slug);
  const query = { ...parseCatalogParams(sp), category: cat.slug };
  const trail = [
    { name: t("common.home"), path: "/" },
    { name: t("catalog.title"), path: "/catalog" },
    ...cat.breadcrumbs.map((b) => ({ name: b.name, path: `/catalog/${b.slug}` })),
  ];
  if (!cat.breadcrumbs.some((b) => b.slug === cat.slug)) trail.push({ name: cat.name, path: `/catalog/${cat.slug}` });

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <CatalogView
        title={cat.name}
        description={cat.description || undefined}
        crumbs={trail.map((c, i) => ({ name: c.name, href: i < trail.length - 1 ? c.path : undefined }))}
        query={query}
        basePath={`/catalog/${cat.slug}`}
        params={sp}
        subcategories={cat.children}
      />
    </>
  );
}
