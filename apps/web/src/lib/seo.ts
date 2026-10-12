import { SITE_URL, EMAIL, PHONES, SOCIAL, MARKETPLACES } from "./site";
import { t, tx } from "@/i18n";
import type { ProductDetail } from "./api/types";

export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function organizationLd() {
  const points = tx("company.pickupPoints");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("meta.siteName"),
    url: SITE_URL,
    logo: abs("/brand/logo.png"),
    email: EMAIL,
    contactPoint: PHONES.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.href.replace("tel:", ""),
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: "Russian",
    })),
    address: points.map((p) => ({ "@type": "PostalAddress", streetAddress: p.address, addressCountry: "RU" })),
    sameAs: [...SOCIAL.map((s) => s.href), ...MARKETPLACES.map((m) => m.href)],
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

const availability = {
  in: "https://schema.org/InStock",
  low: "https://schema.org/LimitedAvailability",
  out: "https://schema.org/OutOfStock",
} as const;

export function productLd(p: ProductDetail) {
  const images = p.images.map((i) => i.url).filter(Boolean);
  const rating = Number(p.rating_avg);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku ?? undefined,
    description: p.seo.description || p.description || undefined,
    image: images.length ? images : undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    category: p.category.name,
    url: abs(`/product/${p.slug}`),
    offers: {
      "@type": "Offer",
      url: abs(`/product/${p.slug}`),
      priceCurrency: p.currency || "RUB",
      price: (p.price_minor / 100).toFixed(2),
      availability: availability[p.stock_level],
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: t("meta.siteName") },
    },
    aggregateRating:
      p.rating_count > 0 && rating > 0
        ? { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: p.rating_count }
        : undefined,
  };
}
