import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <img src="/favicon.svg" alt="" className="size-7 shrink-0 rounded-md" />
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-bold tracking-wide">{t.app.name}</div>
          <div className="text-[11px] text-muted-foreground">{t.app.admin}</div>
        </div>
      )}
    </div>
  );
}
