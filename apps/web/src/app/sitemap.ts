import type { MetadataRoute } from "next";
import { api } from "@/lib/api/server";
import type { CategoryNode, ProductPage } from "@/lib/api/types";
import { SITE_URL } from "@/lib/site";

// Rendered on request (never at build time), so an unreachable API can't fail the build.
export const dynamic = "force-dynamic";

const flatten = (nodes: CategoryNode[]): CategoryNode[] => nodes.flatMap((n) => [n, ...flatten(n.children)]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = ["", "/catalog", "/about", "/contacts", "/delivery", "/wholesale", "/privacy"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));

  const cats = flatten(await api.soft(api.categories(), []));
  cats.forEach((c) => entries.push({ url: `${SITE_URL}/catalog/${c.slug}`, lastModified: now, changeFrequency: "daily", priority: 0.8 }));

  const empty: ProductPage = { items: [], total: 0, page: 1, per_page: 60, price_min: 0, price_max: 0 };
  for (let page = 1; page <= 200; page++) {
    const res = await api.soft(api.products({ page, per_page: 60, sort: "new" }), empty);
    res.items.forEach((p) => entries.push({ url: `${SITE_URL}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 }));
    if (page * 60 >= res.total || !res.items.length) break;
  }
  return entries;
}
