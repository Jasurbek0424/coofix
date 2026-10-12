import { AlertTriangleIcon, ClockIcon, type LucideIcon, ShoppingCartIcon, UserPlusIcon, WalletIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboard } from "@/api/hooks";
import type { Dashboard } from "@/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { QueryError } from "@/components/common/query-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { cn } from "@/lib/utils";

function Kpi({
  label,
  value,
  icon: Icon,
  to,
  tone,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  to?: string;
  tone?: "warning";
  loading?: boolean;
}) {
  const body = (
    <Card className={cn("h-full p-4 transition-colors", to && "hover:border-primary/40 hover:bg-accent/40")}>
      <div className="flex items-center justify-between gap-2 text-[13px] text-muted-foreground">
        <span className="truncate">{label}</span>
        <Icon className={cn("size-4 shrink-0", tone === "warning" && "text-warning")} />
      </div>
      {loading ? <Skeleton className="mt-3 h-7 w-24" /> : <div className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</div>}
    </Card>
  );
  return to ? (
    <Link to={to} className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Fill missing days with zeros so the series is continuous over the last 30 days. */
function fillDays(daily: Dashboard["daily"]) {
  const map = new Map(daily.map((d) => [d.date, d]));
  const out: { date: string; orders: number; revenue: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    const row = map.get(key);
    out.push({ date: key, orders: row?.orders ?? 0, revenue: row?.revenue_minor ?? 0 });
  }
  return out;
}

type Metric = "revenue" | "orders";

function DailyChart({ data }: { data: Dashboard["daily"] }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const rows = useMemo(() => fillDays(data), [data]);
  const empty = rows.every((r) => r.orders === 0);
  const fmt = (v: number) => (metric === "revenue" ? formatMoney(v) : formatNumber(v));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>{t.dashboard.chartTitle}</CardTitle>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList>
            <TabsTrigger value="revenue">{t.dashboard.chartRevenue}</TabsTrigger>
            <TabsTrigger value="orders">{t.dashboard.chartOrders}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState title={t.dashboard.noData} className="h-64 py-0" />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDayMonth}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  width={56}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={(v: number) => (metric === "revenue" ? formatMoneyCompact(v) : formatNumber(v))}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    const p = payload?.[0]?.payload as (typeof rows)[number] | undefined;
                    if (!active || !p) return null;
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                        <div className="mb-1 text-muted-foreground">{formatDayMonth(p.date)}</div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-chart-1" />
                          <span className="font-medium tabular">{fmt(p[metric])}</span>
                        </div>
                        <div className="mt-0.5 text-muted-foreground tabular">
                          {metric === "revenue" ? `${t.dashboard.chartOrders}: ${p.orders}` : `${t.dashboard.chartRevenue}: ${formatMoney(p.revenue)}`}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#fillMetric)"
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { can } = useAuth();
  const q = useDashboard();
  const d = q.data;
  const loading = q.isLoading;

  return (
    <>
      <PageHeader title={t.dashboard.title} description={t.dashboard.subtitle} />
      {q.error && !d ? (
        <Card>
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label={t.dashboard.revenue} value={formatMoney(d?.revenue_minor_30d ?? 0)} icon={WalletIcon} loading={loading} />
            <Kpi label={t.dashboard.orders} value={formatNumber(d?.orders_30d ?? 0)} icon={ShoppingCartIcon} loading={loading} to="/orders" />
            <Kpi
              label={t.dashboard.pending}
              value={formatNumber(d?.pending_orders ?? 0)}
              icon={ClockIcon}
              loading={loading}
              to="/orders?status=pending"
            />
            <Kpi
              label={t.dashboard.newCustomers}
              value={formatNumber(d?.new_customers_30d ?? 0)}
              icon={UserPlusIcon}
              loading={loading}
              to={can("customers.read") ? "/users?role=customer" : undefined}
            />
            <Kpi
              label={t.dashboard.lowStock}
              value={formatNumber(d?.low_stock_products ?? 0)}
              icon={AlertTriangleIcon}
              tone={d && d.low_stock_products > 0 ? "warning" : undefined}
              loading={loading}
              to={can("catalog.write") ? "/products?low_stock=1&is_active=true" : undefined}
            />
          </div>
          {loading ? (
            <Card className="p-4">
              <Skeleton className="mb-4 h-5 w-48" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ) : (
            d && <DailyChart data={d.daily} />
          )}
        </div>
      )}
    </>
  );
}
