import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/ru";
import { formatNumber } from "@/lib/format";

export function Pagination({
  page,
  perPage,
  total,
  onPage,
}: {
  page: number;
  perPage: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[13px] text-muted-foreground">
      <span className="tabular">
        {formatNumber(from)}–{formatNumber(to)} {t.common.of} {formatNumber(total)}
      </span>
      <div className="flex items-center gap-1">
        <span className="mr-2 hidden tabular sm:inline">
          {t.common.page} {page} / {pages}
        </span>
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t.common.prev}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon-sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={t.common.next}>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
