import type { Metadata } from "next";
import { t, tx } from "@/i18n";
import { StaticPage } from "@/components/ui/StaticPage";

export const metadata: Metadata = { title: t("pages.privacy.title"), alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <StaticPage title={t("pages.privacy.title")}>
      <div className="max-w-3xl space-y-8 rounded-2xl border border-line bg-surface p-6 sm:p-10">
        {tx("pages.privacy.sections").map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <div className="prose-coofix mt-3 leading-relaxed text-ink-2">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
          </section>
        ))}
        <p className="text-sm text-muted">{t("pages.privacy.updated")}</p>
      </div>
    </StaticPage>
  );
}
