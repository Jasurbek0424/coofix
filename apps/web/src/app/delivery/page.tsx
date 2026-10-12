import type { Metadata } from "next";
import { PASS_PHONE } from "@/lib/site";
import { t, tx } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Card, StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = { title: t("pages.delivery.title"), description: t("pages.delivery.lead"), alternates: { canonical: "/delivery" } };

export default function DeliveryPage() {
  return (
    <StaticPage title={t("pages.delivery.title")} lead={t("pages.delivery.lead")}>
      <section>
        <h2 className="font-display text-2xl font-bold">{t("pages.delivery.paymentTitle")}</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {tx("pages.delivery.payments").map((p) => (
            <li key={p.title}><Card className="h-full"><h3 className="text-lg font-semibold">{p.title}</h3><p className="mt-2 text-ink-2">{p.text}</p></Card></li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{t("pages.delivery.onlineSoon")}</p>
      </section>
      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <Card>
          <Icon name="store" className="size-8 text-brand-text" />
          <h2 className="mt-4 font-display text-2xl font-bold">{t("pages.delivery.pickupTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("pages.delivery.pickupText")}</p>
          <ul className="mt-4 space-y-3">
            {tx("company.pickupPoints").map((p) => <li key={p.title}><b className="font-semibold">{p.title}</b><br /><span className="text-ink-2">{p.address}</span></li>)}
          </ul>
          <p className="mt-5 rounded-xl bg-warning-soft p-4 text-sm">{t("company.passNote")} {t("company.passPhone")}: <a href={PASS_PHONE.href} className="font-semibold">{PASS_PHONE.display}</a></p>
        </Card>
        <Card>
          <Icon name="truck" className="size-8 text-brand-text" />
          <h2 className="mt-4 font-display text-2xl font-bold">{t("pages.delivery.courierTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("pages.delivery.courierText")}</p>
        </Card>
      </section>
      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-bold">{t("pages.delivery.faqTitle")}</h2>
        <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface">
          {tx("pages.delivery.faq").map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{f.q}<Icon name="chevronDown" className="size-4 transition-transform group-open:rotate-180" /></summary>
              <p className="mt-3 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </StaticPage>
  );
}
