import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, MoreHorizontalIcon, PackageIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useBrands, useCategories, useDeleteProduct, useProducts, useToggleProductActive } from "@/api/hooks";
import type { Product } from "@/api/types";
import { CategorySelect } from "@/components/common/category-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, StopPropagation } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUrlFilters } from "@/hooks/use-search-params-state";
import { t } from "@/i18n/ru";
import { categoryPath } from "@/lib/category-tree";
import { LOW_STOCK } from "@/lib/config";
import { formatRelative } from "@/lib/format";
import { formatMoney } from "@/lib/money";

const PER_PAGE = 25;
const FILTERS = ["q", "category_id", "brand_id", "is_active", "low_stock"] as const;

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="destructive">{t.products.outOfStock}</Badge>;
  if (stock <= LOW_STOCK) return <Badge variant="warning">{t.products.lowStock}</Badge>;
  return null;
}

export default function ProductsListPage() {
  const navigate = useNavigate();
  const { values: f, set, reset, page, active } = useUrlFilters(FILTERS);
  const filters = {
    q: f.q,
    category_id: f.category_id ? Number(f.category_id) : undefined,
    brand_id: f.brand_id ? Number(f.brand_id) : undefined,
    is_active: f.is_active === "true" ? true : f.is_active === "false" ? false : undefined,
    low_stock: f.low_stock === "1" ? true : undefined,
    page,
    per_page: PER_PAGE,
  };
  const q = useProducts(filters);
  const cats = useCategories();
  const brands = useBrands();
  const toggle = useToggleProductActive();
  const del = useDeleteProduct();
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "product",
        header: t.products.colProduct,
        cell: ({ row: { original: p } }) => (
          <div className="flex min-w-56 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
              {p.images[0] ? (
                <img src={p.images[0].url} alt="" className="size-full object-contain" loading="lazy" />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{p.name.ru}</span>
                {p.is_new && <Badge variant="info">{t.products.isNew}</Badge>}
                {p.is_hit && <Badge>{t.products.isHit}</Badge>}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                <span className="md:hidden">{p.sku ? `${p.sku} · ` : ""}</span>
                {categoryPath(cats.data, p.category_id) || p.slug}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "sku",
        header: t.products.colSku,
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.sku ?? "—"}</span>,
      },
      {
        id: "price",
        header: t.products.colPrice,
        meta: { className: "text-right", headClassName: "text-right" },
        cell: ({ row: { original: p } }) => (
          <div className="text-right whitespace-nowrap tabular">
            <div className="font-medium">{formatMoney(p.price_minor)}</div>
            {p.old_price_minor != null && <div className="text-xs text-muted-foreground line-through">{formatMoney(p.old_price_minor)}</div>}
          </div>
        ),
      },
      {
        id: "stock",
        header: t.products.colStock,
        meta: { className: "text-right", headClassName: "text-right" },
        cell: ({ row: { original: p } }) => (
          <div className="flex items-center justify-end gap-1.5 tabular">
            <StockBadge stock={p.stock} />
            <span className={p.stock <= LOW_STOCK ? "font-medium" : undefined}>{p.stock}</span>
          </div>
        ),
      },
      {
        id: "active",
        header: t.products.colActive,
        meta: { className: "hidden sm:table-cell" },
        cell: ({ row: { original: p } }) => (
          <StopPropagation>
            <Switch
              checked={p.is_active}
              aria-label={t.products.colActive}
              onCheckedChange={(v) =>
                toggle.mutate(
                  { id: p.id, is_active: v },
                  { onSuccess: () => toast.success(v ? t.products.activated : t.products.deactivated) },
                )
              }
            />
          </StopPropagation>
        ),
      },
      {
        id: "updated",
        header: t.products.colUpdated,
        meta: { className: "hidden xl:table-cell text-muted-foreground whitespace-nowrap" },
        cell: ({ row }) => formatRelative(row.original.updated_at),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t.common.actions}</span>,
        size: 48,
        cell: ({ row: { original: p } }) => (
          <StopPropagation className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label={t.common.actions}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/products/${p.id}`}>
                    <PencilIcon />
                    {t.common.edit}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                  <Trash2Icon />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </StopPropagation>
        ),
      },
    ],
    [cats.data, toggle],
  );

  return (
    <>
      <PageHeader
        title={t.products.title}
        description={q.data ? `${t.common.total}: ${q.data.total}` : t.products.subtitle}
        actions={
          <Button asChild>
            <Link to="/products/new">
              <PlusIcon />
              {t.products.new}
            </Link>
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <SearchInput value={f.q ?? ""} onChange={(v) => set({ q: v })} placeholder={t.products.searchPlaceholder} className="w-full sm:w-64" />
          <CategorySelect
            categories={cats.data}
            value={filters.category_id ?? null}
            onChange={(id) => set({ category_id: id != null ? String(id) : undefined })}
            allowNone
            noneLabel={t.products.allCategories}
            className="w-full sm:w-52"
          />
          <Select value={f.brand_id ?? "all"} onValueChange={(v) => set({ brand_id: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-[calc(50%-4px)] sm:w-40" aria-label={t.products.filterBrand}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.products.allBrands}</SelectItem>
              {brands.data?.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={f.is_active ?? "all"} onValueChange={(v) => set({ is_active: v === "all" ? undefined : v })}>
            <SelectTrigger className="w-[calc(50%-4px)] sm:w-36" aria-label={t.products.filterStatus}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="true">{t.products.onlyActive}</SelectItem>
              <SelectItem value="false">{t.products.onlyInactive}</SelectItem>
            </SelectContent>
          </Select>
          <Label className="h-9 cursor-pointer rounded-md border px-3 font-normal shadow-xs">
            <Checkbox checked={f.low_stock === "1"} onCheckedChange={(v) => set({ low_stock: v === true ? "1" : undefined })} />
            {t.products.filterLowStock}
          </Label>
          {active && (
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
          onRowClick={(p) => void navigate(`/products/${p.id}`)}
          getRowId={(p) => String(p.id)}
          empty={{
            icon: PackageIcon,
            title: t.products.empty,
            description: t.products.emptyHint,
            action: active ? (
              <Button variant="outline" size="sm" onClick={reset}>
                {t.common.reset}
              </Button>
            ) : undefined,
          }}
        />
      </Card>
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t.products.deleteTitle}
        description={
          <>
            <span className="font-medium text-foreground">{toDelete?.name.ru}</span>. {t.products.deleteText}
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          await del.mutateAsync(toDelete.id);
          toast.success(t.common.deleted);
        }}
      />
    </>
  );
}
