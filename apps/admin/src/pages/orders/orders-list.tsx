import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon, ShoppingCartIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { useOrder, useOrders } from "@/api/hooks";
import { ORDER_STATUSES, PAYMENT_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "@/api/types";
import { DataTable } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { QueryError } from "@/components/common/query-error";
import { SearchInput } from "@/components/common/search-input";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-search-params-state";
import { t } from "@/i18n/ru";
import { formatDateTime, formatPhone, formatRelative } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { OrderDetail } from "./order-detail";

const PER_PAGE = 25;
const FILTERS = ["q", "status", "payment_status", "from", "to", "open"] as const;

/** "2026-10-01" (local day) → ISO instant at local midnight; `to` is exclusive so +1 day. */
function dayToIso(day: string | undefined, addDays = 0): string | undefined {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined;
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d + addDays).toISOString();
}

export default function OrdersListPage() {
  const { values: f, set, reset, page } = useUrlFilters(FILTERS);
  const filters = {
    q: f.q,
    status: f.status as OrderStatus | undefined,
    payment_status: f.payment_status as PaymentStatus | undefined,
    date_from: dayToIso(f.from),
    date_to: dayToIso(f.to, 1),
    page,
    per_page: PER_PAGE,
  };
  const q = useOrders(filters);
  const hasFilters = !!(f.q || f.status || f.payment_status || f.from || f.to);
  const openId = f.open;
  const setOpen = (id: string | undefined) => set({ open: id, page: String(page) });

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "number",
        header: t.orders.colNumber,
        cell: ({ row: { original: o } }) => (
          <div>
            <div className="font-medium tabular">#{o.number}</div>
            <div className="text-xs text-muted-foreground md:hidden">{formatRelative(o.created_at)}</div>
          </div>
        ),
      },
      {
        id: "date",
        header: t.orders.colDate,
        meta: { className: "hidden md:table-cell whitespace-nowrap text-muted-foreground" },
        cell: ({ row }) => <span title={formatDateTime(row.original.created_at)}>{formatDateTime(row.original.created_at)}</span>,
      },
      {
        id: "customer",
        header: t.orders.colCustomer,
        cell: ({ row: { original: o } }) => (
          <div className="min-w-36">
            <div className="truncate font-medium">{o.customer_name}</div>
            <div className="text-xs whitespace-nowrap text-muted-foreground">{formatPhone(o.phone)}</div>
          </div>
        ),
      },
      {
        id: "status",
        header: t.orders.colStatus,
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        id: "payment",
        header: t.orders.colPayment,
        meta: { className: "hidden lg:table-cell" },
        cell: ({ row }) => <PaymentStatusBadge status={row.original.payment_status} />,
      },
      {
        id: "delivery",
        header: t.orders.colDelivery,
        meta: { className: "hidden xl:table-cell text-muted-foreground" },
        cell: ({ row }) => t.deliveryMethod[row.original.delivery_method],
      },
      {
        id: "total",
        header: t.orders.colTotal,
        meta: { className: "text-right", headClassName: "text-right" },
        cell: ({ row: { original: o } }) => (
          <div className="text-right whitespace-nowrap tabular">
            <div className="font-medium">{formatMoney(o.total_minor)}</div>
            <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.quantity, 0)} {t.orders.pcs}</div>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader title={t.orders.title} description={q.data ? `${t.common.total}: ${q.data.total}` : t.orders.subtitle} />
      <div className="-mx-3 mb-3 flex gap-1 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {([undefined, ...ORDER_STATUSES] as (OrderStatus | undefined)[]).map((s) => (
          <button
            key={s ?? "all"}
            type="button"
            onClick={() => set({ status: s })}
            className={cn(
              "h-7 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
              f.status === s ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {s ? t.orderStatus[s] : t.orders.allStatuses}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <SearchInput value={f.q ?? ""} onChange={(v) => set({ q: v })} placeholder={t.orders.searchPlaceholder} className="w-full sm:w-72" />
          <Select value={f.payment_status ?? "all"} onValueChange={(v) => set({ payment_status: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-full sm:w-44" aria-label={t.orders.filterPayment}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.orders.allPayments}</SelectItem>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t.paymentStatus[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex w-full items-center gap-1.5 sm:w-auto">
            <Input
              type="date"
              value={f.from ?? ""}
              max={f.to}
              onChange={(e) => set({ from: e.target.value })}
              aria-label={t.orders.dateFrom}
              className="w-full sm:w-38"
            />
            <span className="text-muted-foreground">—</span>
            <Input type="date" value={f.to ?? ""} min={f.from} onChange={(e) => set({ to: e.target.value })} aria-label={t.orders.dateTo} className="w-full sm:w-38" />
          </div>
          {hasFilters && (
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
          onRowClick={(o) => setOpen(o.id)}
          getRowId={(o) => o.id}
          empty={{ icon: ShoppingCartIcon, title: t.orders.empty, description: hasFilters ? t.orders.emptyHint : undefined }}
        />
      </Card>
      <OrderDrawer id={openId} initial={q.data?.items.find((o) => o.id === openId)} onClose={() => setOpen(undefined)} />
    </>
  );
}

function OrderDrawer({ id, initial, onClose }: { id?: string; initial?: Order; onClose: () => void }) {
  const q = useOrder(id);
  const order = q.data ?? initial;
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-2xl" aria-describedby={undefined}>
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle>
              {t.orders.order} {order ? `#${order.number}` : ""}
            </SheetTitle>
            {order && (
              <Button asChild variant="ghost" size="xs" className="text-muted-foreground">
                <Link to={`/orders/${order.id}`}>
                  <ExternalLinkIcon />
                  {t.orders.openFull}
                </Link>
              </Button>
            )}
          </div>
          {order && <SheetDescription>{formatDateTime(order.created_at)}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {order ? (
            <OrderDetail order={order} />
          ) : q.error ? (
            <QueryError error={q.error} onRetry={() => void q.refetch()} />
          ) : (
            <div className="grid gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-40" />
              <Skeleton className="h-32" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
