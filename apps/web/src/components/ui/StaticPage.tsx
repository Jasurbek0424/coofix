import type { ReactNode } from "react";
import { t } from "@/i18n";
import { Breadcrumbs } from "./misc";

export function StaticPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <div className="container-page pt-5 sm:pt-8">
      <Breadcrumbs items={[{ name: t("common.home"), href: "/" }, { name: title }]} />
      <header className="mb-10 mt-4 max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 text-lg leading-relaxed text-muted">{lead}</p>}
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-6 sm:p-8 ${className}`}>{children}</div>;
}
