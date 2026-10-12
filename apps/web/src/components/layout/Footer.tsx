import Link from "next/link";
import type { CategoryNode } from "@/lib/api/types";
import { EMAIL, MARKETPLACES, PHONES, SOCIAL } from "@/lib/site";
import { t, tx } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export function Footer({ categories }: { categories: CategoryNode[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-coal pb-24 text-white/70 lg:pb-0">
      <div className="h-1 bg-brand" aria-hidden="true" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label={t("meta.siteName")} className="inline-block">
            <Logo inverted />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{t("footer.tagline")}</p>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-white/50">{t("footer.marketplaces")}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {MARKETPLACES.map((m) => (
              <li key={m.id}>
                <a href={m.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-sm text-white transition-colors hover:border-brand hover:text-brand">
                  {m.label}
                  <Icon name="external" className="size-3.5 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label={t("footer.catalog")}>
          <h2 className="text-sm font-semibold text-white">{t("footer.catalog")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/catalog/${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("footer.buyers")}>
          <h2 className="text-sm font-semibold text-white">{t("footer.buyers")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/delivery" className="hover:text-brand">{t("nav.delivery")}</Link></li>
            <li><Link href="/wholesale" className="hover:text-brand">{t("nav.wholesale")}</Link></li>
            <li><Link href="/about" className="hover:text-brand">{t("nav.about")}</Link></li>
            <li><Link href="/contacts" className="hover:text-brand">{t("nav.contacts")}</Link></li>
            <li><Link href="/account" className="hover:text-brand">{t("nav.account")}</Link></li>
            <li><Link href="/privacy" className="hover:text-brand">{t("nav.privacy")}</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-semibold text-white">{t("footer.contacts")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {PHONES.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="text-lg font-semibold text-white tabular hover:text-brand">{p.display}</a>
              </li>
            ))}
            <li><a href={`mailto:${EMAIL}`} className="hover:text-brand">{EMAIL}</a></li>
            <li className="flex gap-2"><Icon name="clock" className="mt-0.5 size-4 shrink-0" />{t("company.hours")}</li>
            {tx("company.pickupPoints").map((p) => (
              <li key={p.title} className="flex gap-2">
                <Icon name="mapPin" className="mt-0.5 size-4 shrink-0" />
                <span><span className="text-white">{p.title}</span>, {p.address}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex gap-2" aria-label={t("footer.social")}>
            {SOCIAL.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand hover:text-coal">
                  <Icon name={s.id} className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {t("company.legalName")}. {t("footer.rights")}</p>
          <Link href="/privacy" className="hover:text-brand">{t("footer.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
