import type { Metadata } from "next";
import Image from "next/image";
import { t, tx } from "@/i18n";
import factory from "@/assets/about-factory.jpg";
import { Icon } from "@/components/ui/Icon";
import { Card, StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = { title: t("pages.about.title"), description: t("pages.about.lead"), alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <StaticPage title={t("pages.about.title")} lead={t("pages.about.lead")}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tx("pages.about.stats").map((s) => (
          <div key={s.label} className="rounded-2xl bg-coal p-6 text-white">
            <dd className="font-display text-3xl font-bold text-brand">{s.value}</dd>
            <dt className="mt-2 text-sm text-white/70">{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
        <Image src={factory} alt={t("pages.about.factoryTitle")} placeholder="blur" sizes="(min-width:1024px) 50vw, 100vw" className="rounded-2xl" />
        <div>
          <p className="text-lg leading-relaxed text-ink-2">{t("pages.about.intro")}</p>
          <h2 className="mt-8 font-display text-2xl font-bold">{t("pages.about.factoryTitle")}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {tx("pages.about.factory").map((f) => <li key={f} className="flex gap-2"><Icon name="check" className="mt-0.5 size-5 shrink-0 text-brand-text" />{f}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="font-display text-xl font-bold">{t("pages.about.productTitle")}</h2>
          <p className="mt-3 text-ink-2">{t("pages.about.product")}</p>
          <dl className="mt-4 space-y-2 text-sm">{tx("pages.about.productFacts").map((f) => <div key={f.label} className="flex justify-between gap-3"><dt className="text-muted">{f.label}</dt><dd className="font-semibold">{f.value}</dd></div>)}</dl>
        </Card>
        <Card><h2 className="font-display text-xl font-bold">{t("pages.about.qualityTitle")}</h2><p className="mt-3 text-ink-2">{t("pages.about.quality")}</p></Card>
        <Card>
          <h2 className="font-display text-xl font-bold">{t("pages.about.serviceTitle")}</h2>
          <ul className="mt-3 space-y-2 text-ink-2">{tx("pages.about.service").map((s) => <li key={s} className="flex gap-2"><Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand-text" />{s}</li>)}</ul>
        </Card>
      </div>
      <div className="mt-10 rounded-2xl border-l-4 border-brand bg-surface p-8">
        <h2 className="font-display text-2xl font-bold">{t("pages.about.missionTitle")}</h2>
        <p className="mt-3 max-w-3xl text-lg text-ink-2">{t("pages.about.mission")}</p>
      </div>
    </StaticPage>
  );
}
