import Link from "next/link";
import { Suspense } from "react";
import { api } from "@/lib/api/server";
import type { CategoryNode, ProductPage, ProductQuery } from "@/lib/api/types";
import { t, tp } from "@/i18n";
import { Breadcrumbs, EmptyState, type Crumb } from "@/components/ui/misc";
import { ProductGrid } from "@/components/product/ProductCard";
import { CatalogToolbar, FiltersSidebar } from "./Filters";
import { Pagination } from "./Pagination";
import { hasFilters, type RawParams } from "./params";

interface Props {
  title: string;
  description?: string;
  crumbs: Crumb[];
  query: ProductQuery;
  basePath: string;
  params: RawParams;
  subcategories?: CategoryNode[];
  emptyTitle?: string;
  emptyText?: string;
}

const EMPTY: ProductPage = { items: [], total: 0, page: 1, per_page: 24, price_min: 0, price_max: 0 };

export async function CatalogView({ title, description, crumbs, query, basePath, params, subcategories, emptyTitle, emptyText }: Props) {
  const [data, brands] = await Promise.all([api.soft(api.products(query), EMPTY), api.soft(api.brands(), [])]);
  const filtered = hasFilters(query);

  return (
    <div className="container-page pt-5 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <div className="mb-6 mt-4 sm:mb-8">
        <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted lg:hidden">{tp("catalog.found", data.total)}</p>
        {description && <p className="mt-3 max-w-3xl text-[15px] text-muted">{description}</p>}
      </div>

      {subcategories && subcategories.length > 0 && (
        <nav aria-label={t("catalog.subcategories")} className="scrollbar-none -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2 sm:flex-wrap">
            {subcategories.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link href={`/catalog/${c.slug}`} className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium transition-colors hover:border-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="grid gap-6 lg:grid-cols-[272px_1fr] lg:gap-8">
        <Suspense>
          <FiltersSidebar brands={brands} priceMin={data.price_min} priceMax={data.price_max} />
        </Suspense>
        <div className="min-w-0">
          <Suspense>
            <CatalogToolbar brands={brands} priceMin={data.price_min} priceMax={data.price_max} total={data.total} />
          </Suspense>
          {data.items.length ? (
            <>
              <ProductGrid products={data.items} priorityCount={4} />
              <Pagination basePath={basePath} params={params} page={query.page ?? 1} total={data.total} perPage={data.per_page} />
            </>
          ) : (
            <EmptyState
              icon="search"
              title={emptyTitle ?? t("catalog.emptyTitle")}
              text={emptyText ?? (filtered ? t("catalog.emptyText") : t("home.emptyCatalog"))}
              action={
                filtered ? (
                  <Link href={basePath} className="font-semibold text-brand-text hover:underline">{t("catalog.resetFilters")}</Link>
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
