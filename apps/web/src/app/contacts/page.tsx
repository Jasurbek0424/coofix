import type { Metadata } from "next";
import { EMAIL, MAP_EMBED, PHONES, SOCIAL } from "@/lib/site";
import { t, tx } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Card, StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = { title: t("pages.contacts.title"), description: t("pages.contacts.lead"), alternates: { canonical: "/contacts" } };

export default function ContactsPage() {
  return (
    <StaticPage title={t("pages.contacts.title")} lead={t("pages.contacts.lead")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-7">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t("pages.contacts.phones")}</h2>
            {PHONES.map((p) => <a key={p.href} href={p.href} className="mt-2 block font-display text-2xl font-bold tabular hover:text-brand-text">{p.display}</a>)}
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t("pages.contacts.email")}</h2>
            <a href={`mailto:${EMAIL}`} className="mt-2 inline-flex items-center gap-2 text-lg font-semibold hover:text-brand-text"><Icon name="mail" />{EMAIL}</a>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t("pages.contacts.hours")}</h2>
            <p className="mt-2 inline-flex items-center gap-2 text-lg"><Icon name="clock" />{t("company.hours")}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t("pages.contacts.addresses")}</h2>
            <ul className="mt-2 space-y-3">
              {tx("company.pickupPoints").map((p) => (
                <li key={p.title} className="flex gap-3"><Icon name="mapPin" className="mt-0.5 size-5 shrink-0 text-brand-text" /><span><b className="font-semibold">{p.title}</b><br /><span className="text-ink-2">{p.address}</span></span></li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">{t("company.passNote")}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{t("pages.contacts.social")}</h2>
            <ul className="mt-3 flex gap-2">
              {SOCIAL.map((s) => (
                <li key={s.id}><a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid size-11 place-items-center rounded-full bg-surface-3 transition-colors hover:bg-brand hover:text-on-brand"><Icon name={s.id} /></a></li>
              ))}
            </ul>
          </div>
        </Card>
        <div className="relative min-h-96 overflow-hidden rounded-2xl border border-line bg-surface-2">
          <iframe src={MAP_EMBED} title={t("pages.contacts.mapTitle")} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0" />
        </div>
      </div>
    </StaticPage>
  );
}
