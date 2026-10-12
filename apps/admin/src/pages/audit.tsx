import type { ColumnDef } from "@tanstack/react-table";
import { ScrollTextIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useAudit } from "@/api/hooks";
import type { AuditEntry } from "@/api/types";
import { DataTable } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlFilters } from "@/hooks/use-search-params-state";
import { t } from "@/i18n/ru";
import { formatDateTime } from "@/lib/format";

const PER_PAGE = 50;
const FILTERS = ["entity", "entity_id", "actor"] as const;
const ENTITIES = ["product", "category", "brand", "order", "user", "media"];

function entityLink(e: AuditEntry): string | null {
  if (!e.entity_id) return null;
  switch (e.entity) {
    case "product":
      return e.action === "product.delete" ? null : `/products/${e.entity_id}`;
    case "order":
      return `/orders/${e.entity_id}`;
    default:
      return null;
  }
}

/** One-line human summary of the payload for the table. */
function summary(e: AuditEntry): string {
  const d = e.data ?? {};
  if (e.action === "product.stock") return `${String(d.before)} → ${String(d.after)} · ${String(d.reason ?? "")}`;
  if (e.action === "order.status") return `${t.orderStatus[d.from as keyof typeof t.orderStatus] ?? d.from} → ${t.orderStatus[d.to as keyof typeof t.orderStatus] ?? d.to}`;
  const keys = Object.keys(d);
  return keys.length ? keys.join(", ") : "";
}

export default function AuditPage() {
  const { values: f, set, reset, page } = useUrlFilters(FILTERS);
  const q = useAudit({
    entity: f.entity,
    entity_id: f.entity_id,
    actor_user_id: f.actor && /^\d+$/.test(f.actor) ? Number(f.actor) : undefined,
    page,
    per_page: PER_PAGE,
  });
  const [open, setOpen] = useState<AuditEntry | null>(null);

  const columns = useMemo<ColumnDef<AuditEntry>[]>(
    () => [
      {
        id: "time",
        header: t.audit.colTime,
        meta: { className: "whitespace-nowrap text-muted-foreground tabular" },
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
      {
        id: "actor",
        header: t.audit.colActor,
        cell: ({ row: { original: e } }) =>
          e.actor_user_id ? (
            <button
              type="button"
              className="font-mono text-xs hover:text-primary hover:underline"
              onClick={(ev) => {
                ev.stopPropagation();
                set({ actor: String(e.actor_user_id) });
              }}
            >
              #{e.actor_user_id}
            </button>
          ) : (
            <span className="text-muted-foreground">{t.audit.system}</span>
          ),
      },
      {
        id: "action",
        header: t.audit.colAction,
        cell: ({ row: { original: e } }) => (
          <div className="min-w-40">
            <div className="font-medium">{t.auditAction[e.action] ?? e.action}</div>
            <div className="max-w-80 truncate text-xs text-muted-foreground">{summary(e)}</div>
          </div>
        ),
      },
      {
        id: "entity",
        header: t.audit.colEntity,
        cell: ({ row: { original: e } }) => {
          const link = entityLink(e);
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Badge variant="secondary">{t.auditEntity[e.entity] ?? e.entity}</Badge>
              {e.entity_id &&
                (link ? (
                  <Link to={link} onClick={(ev) => ev.stopPropagation()} className="max-w-32 truncate font-mono text-xs hover:text-primary hover:underline">
                    {e.entity_id}
                  </Link>
                ) : (
                  <span className="max-w-32 truncate font-mono text-xs text-muted-foreground">{e.entity_id}</span>
                ))}
            </div>
          );
        },
      },
      {
        id: "ip",
        header: t.audit.colIp,
        meta: { className: "hidden lg:table-cell font-mono text-xs text-muted-foreground" },
        cell: ({ row }) => row.original.ip ?? "—",
      },
    ],
    [set],
  );

  return (
    <>
      <PageHeader title={t.audit.title} description={t.audit.subtitle} />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <Select value={f.entity ?? "all"} onValueChange={(v) => set({ entity: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-full sm:w-44" aria-label={t.audit.entity}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.audit.allEntities}</SelectItem>
              {ENTITIES.map((e) => (
                <SelectItem key={e} value={e}>
                  {t.auditEntity[e] ?? e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput value={f.entity_id ?? ""} onChange={(v) => set({ entity_id: v })} placeholder={t.audit.entityId} className="w-full sm:w-56" />
          <SearchInput value={f.actor ?? ""} onChange={(v) => set({ actor: v })} placeholder={t.audit.actor} className="w-full sm:w-44" />
          {(f.entity || f.entity_id || f.actor) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon />
              {t.common.reset}
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={q.data?.items}
          isLoading={q.isLoading}
          isFetching={q.isFetching}
          error={q.error}
          onRetry={() => void q.refetch()}
          page={page}
          perPage={PER_PAGE}
          total={q.data?.total}
          onPage={(p) => set({ page: String(p) })}
          onRowClick={setOpen}
          getRowId={(e) => String(e.id)}
          empty={{ icon: ScrollTextIcon, title: t.audit.empty }}
        />
      </Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{t.auditAction[open.action] ?? open.action}</DialogTitle>
                <DialogDescription>
                  {formatDateTime(open.created_at)} · {open.actor_user_id ? `#${open.actor_user_id}` : t.audit.system} · {open.ip ?? "—"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5">
                <div className="text-xs text-muted-foreground">
                  {t.auditEntity[open.entity] ?? open.entity} {open.entity_id}
                </div>
                <pre className="max-h-[60dvh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                  {JSON.stringify(open.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
