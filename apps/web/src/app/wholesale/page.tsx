import type { Metadata } from "next";
import { EMAIL, PHONES } from "@/lib/site";
import { t, tx } from "@/i18n";
import { Card, StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = { title: t("pages.wholesale.title"), description: t("pages.wholesale.lead"), alternates: { canonical: "/wholesale" } };

export default function WholesalePage() {
  return (
    <StaticPage title={t("pages.wholesale.title")} lead={t("pages.wholesale.lead")}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tx("pages.wholesale.points").map((p) => <li key={p.title}><Card className="h-full"><h2 className="font-semibold">{p.title}</h2><p className="mt-2 text-sm text-ink-2">{p.text}</p></Card></li>)}
      </ul>
      <div className="mt-10 rounded-2xl bg-coal p-8 text-white sm:p-12">
        <h2 className="font-display text-2xl font-bold">{t("pages.wholesale.contactTitle")}</h2>
        <p className="mt-3 max-w-2xl text-white/70">{t("pages.wholesale.contactText")}</p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {PHONES.map((p) => <a key={p.href} href={p.href} className="font-display text-xl font-bold hover:text-brand">{p.display}</a>)}
          <a href={`mailto:${EMAIL}`} className="text-xl font-semibold hover:text-brand">{EMAIL}</a>
        </div>
        <p className="mt-6 text-sm text-white/50">{t("pages.wholesale.formSoon")}</p>
      </div>
    </StaticPage>
  );
}
