import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { api, isNotFound } from "@/lib/api/server";
import { breadcrumbLd, productLd } from "@/lib/seo";
import { PHONES } from "@/lib/site";
import { t, tp } from "@/i18n";
import { Breadcrumbs, Price, StockBadge } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/seo/JsonLd";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductBadges } from "@/components/product/ProductCard";
import { ProductRail } from "@/components/product/ProductRail";

const getProduct = cache(async (slug: string) => {
  try {
    return await api.product(slug);
  } catch (e) {
    if (isNotFound(e)) notFound();
    throw e;
  }
});

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  const title = p.seo.title || p.name;
  const description = p.seo.description || p.description.slice(0, 160) || t("meta.defaultDescription");
  const img = p.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description, url: `/product/${p.slug}`, images: img ? [{ url: img, alt: p.name }] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await getProduct(slug);
  const related = await api.soft(api.related(slug), []);
  const trail = [
    { name: t("common.home"), path: "/" },
    { name: t("catalog.title"), path: "/catalog" },
    ...p.breadcrumbs.map((b) => ({ name: b.name, path: `/catalog/${b.slug}` })),
    { name: p.name, path: `/product/${p.slug}` },
  ];
  const attrs = Object.entries(p.attributes ?? {});
  const paragraphs = p.description.split(/\n+/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={productLd(p)} />
      <JsonLd data={breadcrumbLd(trail)} />
      <div className="container-page pt-5 sm:pt-8">
        <Breadcrumbs items={trail.map((c, i) => ({ name: c.name, href: i < trail.length - 1 ? c.path : undefined }))} />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="relative">
            <Gallery images={p.images} name={p.name} />
            <ProductBadges product={p} className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5 lg:left-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {p.brand && <span className="font-semibold uppercase tracking-wider text-ink-2">{p.brand.name}</span>}
              {p.sku && <span>{t("common.sku")} {p.sku}</span>}
              {p.rating_count > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="star" className="size-4 text-brand" fill="currentColor" />
                  {Number(p.rating_avg).toFixed(1)} · {tp("product.reviews", p.rating_count)}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-[2rem]">{p.name}</h1>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <Price price={p.price_minor} old={p.old_price_minor} size="xl" />
              <div className="mt-3">
                <StockBadge level={p.stock_level} />
                {p.stock_level === "low" && <p className="mt-1 text-[13px] text-warning">{t("product.stockLowHint")}</p>}
              </div>
              <div className="mt-6">
                <BuyBox product={p} />
              </div>
            </div>
            <ul className="mt-4 space-y-3 rounded-2xl bg-surface-2 p-5 text-sm text-ink-2">
              <li className="flex gap-3"><Icon name="truck" className="size-5 shrink-0 text-brand-text" />{t("product.deliveryNote")}</li>
              <li className="flex gap-3"><Icon name="shield" className="size-5 shrink-0 text-brand-text" />{t("product.warrantyNote")}</li>
              <li className="flex gap-3">
                <Icon name="phone" className="size-5 shrink-0 text-brand-text" />
                <span>{t("product.consult")}: <a href={PHONES[0].href} className="font-semibold text-ink hover:text-brand-text">{PHONES[0].display}</a></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="specs">
            <h2 id="specs" className="font-display text-xl font-bold tracking-tight sm:text-2xl">{t("product.specs")}</h2>
            {attrs.length ? (
              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {attrs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-4 px-4 py-3 text-[15px]">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-muted">{t("product.noSpecs")}</p>
            )}
          </section>
          <section aria-labelledby="desc">
            <h2 id="desc" className="font-display text-xl font-bold tracking-tight sm:text-2xl">{t("product.description")}</h2>
            <div className="prose-coofix mt-5 text-[15px] leading-relaxed text-ink-2">
              {paragraphs.length ? paragraphs.map((s, i) => <p key={i}>{s}</p>) : <p className="text-muted">{t("product.noDescription")}</p>}
            </div>
          </section>
        </div>
      </div>
      <ProductRail title={t("product.related")} products={related} />
    </div>
  );
}
