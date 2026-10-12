import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api/server";
import type { ProductPage } from "@/lib/api/types";
import { MARKETPLACES } from "@/lib/site";
import { t, tx } from "@/i18n";
import heroImg from "@/assets/hero-saw.jpg";
import concreteImg from "@/assets/concrete-cut.jpg";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { ProductRail } from "@/components/product/ProductRail";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";

const EMPTY: ProductPage = { items: [], total: 0, page: 1, per_page: 8, price_min: 0, price_max: 0 };
const BENEFIT_ICONS: IconName[] = ["shield", "headset", "store", "building"];

export default async function HomePage() {
  const [categories, hits, fresh, sale, brands] = await Promise.all([
    api.soft(api.categories(), []),
    api.soft(api.products({ is_hit: true, per_page: 8 }), EMPTY),
    api.soft(api.products({ is_new: true, sort: "new", per_page: 8 }), EMPTY),
    api.soft(api.products({ on_sale: true, per_page: 8 }), EMPTY),
    api.soft(api.brands(), []),
  ]);
  const catalogEmpty = !categories.length && !hits.items.length && !fresh.items.length && !sale.items.length;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-coal text-white">
        <Image src={heroImg} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover object-[70%_center]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#171a1b_0%,rgb(23_26_27/0.92)_38%,rgb(23_26_27/0.35)_75%,rgb(23_26_27/0.15)_100%)]" />
        <div className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(90deg,black,transparent_60%)]" />
        <div className="container-page flex min-h-[520px] flex-col justify-center py-16 sm:min-h-[580px] lg:min-h-[620px]">
          <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {t("home.heroEyebrow")}
          </p>
          <h1 className="max-w-3xl font-display text-[2.4rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{t("home.heroText")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/catalog" size="lg">
              {t("home.heroCta")}
              <Icon name="arrowRight" className="size-5" />
            </ButtonLink>
            <ButtonLink href="/wholesale" size="lg" variant="ghost" className="text-white ring-1 ring-white/25 hover:bg-white/10">
              {t("home.heroSecondary")}
            </ButtonLink>
          </div>
          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {tx("home.heroStats").map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-xl font-bold text-white sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {catalogEmpty ? (
        <div className="container-page mt-16">
          <EmptyState icon="package" title={t("catalog.title")} text={t("home.emptyCatalog")} />
        </div>
      ) : (
        <>
          {categories.length > 0 && (
            <section className="container-page mt-16 sm:mt-20">
              <SectionHeading title={t("home.categoriesTitle")} eyebrow={t("home.categoriesText")} href="/catalog" />
              <CategoryTiles categories={categories} />
            </section>
          )}
          <ProductRail title={t("home.hitsTitle")} href="/catalog?is_hit=1" products={hits.items} />
          <ProductRail title={t("home.saleTitle")} href="/catalog?on_sale=1" products={sale.items} />
          <ProductRail title={t("home.newTitle")} href="/catalog?is_new=1&sort=new" products={fresh.items} />
        </>
      )}

      {/* Benefits */}
      <section className="container-page mt-16 sm:mt-20" aria-labelledby="benefits">
        <h2 id="benefits" className="sr-only">{t("home.benefitsTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {tx("home.benefits").map((b, i) => (
            <li key={b.title} className="rounded-xl border border-line bg-surface p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-brand-soft text-brand-text">
                <Icon name={BENEFIT_ICONS[i] ?? "shield"} className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {brands.length > 0 && (
        <section className="container-page mt-16 sm:mt-20">
          <SectionHeading title={t("home.brandsTitle")} />
          <ul className="flex flex-wrap gap-2.5">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/catalog?brand=${encodeURIComponent(b.slug)}`} className="inline-flex h-12 items-center rounded-lg border border-line bg-surface px-5 font-display text-sm font-bold tracking-wide transition-colors hover:border-ink">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wholesale CTA */}
      <section className="container-page mt-16 sm:mt-20">
        <div className="relative isolate overflow-hidden rounded-2xl bg-coal px-6 py-12 text-white sm:px-12 sm:py-16">
          <Image src={concreteImg} alt="" fill placeholder="blur" sizes="(min-width:1360px) 1300px, 100vw" className="-z-20 object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#171a1b_10%,rgb(23_26_27/0.6)_70%,transparent)]" />
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{t("home.wholesaleTitle")}</h2>
            <p className="mt-4 text-white/75">{t("home.wholesaleText")}</p>
            <ButtonLink href="/wholesale" size="lg" className="mt-8">
              {t("home.wholesaleCta")}
              <Icon name="arrowRight" className="size-5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Marketplaces */}
      <section className="container-page mt-16 sm:mt-20">
        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{t("home.marketplacesTitle")}</h2>
            <p className="mt-2 text-muted">{t("home.marketplacesText")}</p>
          </div>
          <ul className="flex flex-wrap gap-3">
            {MARKETPLACES.map((m) => (
              <li key={m.id}>
                <a href={m.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border border-line-strong px-5 font-semibold transition-colors hover:border-ink">
                  {m.label}
                  <Icon name="external" className="size-4 text-muted" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
