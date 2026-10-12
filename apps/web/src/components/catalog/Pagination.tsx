import Link from "next/link";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import type { RawParams } from "./params";

function pages(current: number, last: number): (number | "…")[] {
  const set = new Set([1, last, current - 1, current, current + 1].filter((n) => n >= 1 && n <= last));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pagination({ basePath, params, page, total, perPage }: { basePath: string; params: RawParams; page: number; total: number; perPage: number }) {
  const last = Math.max(1, Math.ceil(total / perPage));
  if (last <= 1) return null;
  const href = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k === "page" || v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => sp.append(k, x));
    }
    if (n > 1) sp.set("page", String(n));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const item = "grid h-11 min-w-11 place-items-center rounded-lg px-3 text-sm font-semibold tabular transition-colors";
  return (
    <nav aria-label={t("catalog.pagination")} className="mt-10 flex justify-center">
      <ul className="flex items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(item, "border border-line bg-surface hover:border-ink")} aria-label={t("catalog.prevPage")}><Icon name="chevronLeft" className="size-4" /></Link>
          ) : (
            <span className={cn(item, "border border-line text-muted opacity-50")} aria-hidden="true"><Icon name="chevronLeft" className="size-4" /></span>
          )}
        </li>
        {pages(page, last).map((n, i) => (
          <li key={`${n}-${i}`} className={cn(typeof n === "number" && Math.abs(n - page) > 0 && n !== 1 && n !== last && "hidden sm:block")}>
            {n === "…" ? (
              <span className="px-1 text-muted">…</span>
            ) : n === page ? (
              <span aria-current="page" className={cn(item, "bg-ink text-bg")}>{n}</span>
            ) : (
              <Link href={href(n)} className={cn(item, "border border-line bg-surface hover:border-ink")} aria-label={t("catalog.page", { n })}>{n}</Link>
            )}
          </li>
        ))}
        <li>
          {page < last ? (
            <Link href={href(page + 1)} className={cn(item, "border border-line bg-surface hover:border-ink")} aria-label={t("catalog.nextPage")}><Icon name="chevronRight" className="size-4" /></Link>
          ) : (
            <span className={cn(item, "border border-line text-muted opacity-50")} aria-hidden="true"><Icon name="chevronRight" className="size-4" /></span>
          )}
        </li>
      </ul>
    </nav>
  );
}
