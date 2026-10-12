import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatPrice, discountPercent } from "@/lib/format";
import { t } from "@/i18n";
import type { StockLevel } from "@/lib/api/types";
import { Icon, type IconName } from "./Icon";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "brand" | "dark" | "neutral" | "sale" | "success"; className?: string }) {
  const tones = {
    brand: "bg-brand text-on-brand",
    dark: "bg-ink text-bg",
    neutral: "bg-surface-3 text-ink-2",
    sale: "bg-danger text-white",
    success: "bg-success-soft text-success",
  } as const;
  return (
    <span className={cn("inline-flex h-6 items-center rounded-md px-2 text-xs font-bold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Price({ price, old, size = "md", className }: { price: number; old?: number | null; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const pct = discountPercent(price, old);
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-2xl", xl: "text-[2rem] leading-none sm:text-[2.5rem]" } as const;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn("font-bold tracking-tight tabular", sizes[size], pct && "text-brand-text")}>
        <span className="sr-only">{t("product.price")}: </span>
        {formatPrice(price)}
      </span>
      {pct && old && (
        <>
          <s className={cn("text-muted tabular", size === "xl" ? "text-lg" : "text-sm")}>
            <span className="sr-only">{t("product.oldPrice")}: </span>
            {formatPrice(old)}
          </s>
          {size !== "sm" && (
            <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-xs font-bold text-danger tabular">
              {t("product.badgeSale", { n: pct })}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function StockBadge({ level, className }: { level: StockLevel; className?: string }) {
  const tone = {
    in: "text-success",
    low: "text-warning",
    out: "text-muted",
  }[level];
  const dot = { in: "bg-success", low: "bg-warning", out: "bg-line-strong" }[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", tone, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />
      {t(`product.stock.${level}`)}
    </span>
  );
}

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label={t("common.breadcrumbs")} className={cn("text-[13px] text-muted", className)}>
      <ol className="scrollbar-none flex items-center gap-1 overflow-x-auto whitespace-nowrap">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="rounded px-0.5 transition-colors hover:text-ink">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-ink-2")}>
                  {c.name}
                </span>
              )}
              {!last && <Icon name="chevronRight" className="size-3.5 shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function EmptyState({ icon = "package", title, text, action, className }: { icon?: IconName; title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center sm:py-20", className)}>
      <div className="relative mb-6 grid size-20 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-brand-soft" aria-hidden="true">
          <polygon points="98,50 74,91.6 26,91.6 2,50 26,8.4 74,8.4" fill="currentColor" />
        </svg>
        <Icon name={icon} className="relative size-8 text-brand-text" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-2 max-w-md text-[15px] text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({ title, href, linkLabel, eyebrow, className }: { title: string; href?: string; linkLabel?: string; eyebrow?: string; className?: string }) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4 sm:mb-7", className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-text">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-2 transition-colors hover:text-brand-text">
          {linkLabel ?? t("common.showAll")}
          <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function PageTitle({ children, sub, className }: { children: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">{children}</h1>
      {sub && <p className="mt-2 text-[15px] text-muted">{sub}</p>}
    </div>
  );
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "danger" | "warning" | "success"; title?: ReactNode; children?: ReactNode; className?: string }) {
  const tones = {
    info: "border-line bg-surface-2 text-ink-2",
    danger: "border-danger/30 bg-danger-soft text-ink",
    warning: "border-warning/30 bg-warning-soft text-ink",
    success: "border-success/30 bg-success-soft text-ink",
  } as const;
  const icon: Record<typeof tone, IconName> = { info: "info", danger: "alert", warning: "alert", success: "check" };
  const iconTone = { info: "text-muted", danger: "text-danger", warning: "text-warning", success: "text-success" }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4 text-[15px]", tones[tone], className)}>
      <Icon name={icon[tone]} className={cn("mt-0.5 size-5 shrink-0", iconTone)} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1", "text-ink-2")}>{children}</div>}
      </div>
    </div>
  );
}
