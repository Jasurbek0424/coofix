"use client";

import Link from "next/link";
import { useToasts } from "@/stores/toast";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:right-6 lg:left-auto lg:items-end"
    >
      {toasts.map((x) => (
        <div
          key={x.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm animate-pop items-center gap-3 rounded-xl bg-coal px-4 py-3 text-white shadow-lg ring-1 ring-white/10"
        >
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full",
              x.tone === "danger" ? "bg-danger" : "bg-brand text-coal",
            )}
          >
            <Icon name={x.tone === "danger" ? "alert" : "check"} className="size-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{x.title}</p>
            {x.description && <p className="truncate text-[13px] text-white/70">{x.description}</p>}
          </div>
          {x.action && (
            <Link href={x.action.href} onClick={() => dismiss(x.id)} className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-brand hover:bg-white/10">
              {x.action.label}
            </Link>
          )}
          <button type="button" onClick={() => dismiss(x.id)} className="shrink-0 rounded-md p-1 text-white/60 hover:text-white" aria-label={t("common.close")}>
            <Icon name="close" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
