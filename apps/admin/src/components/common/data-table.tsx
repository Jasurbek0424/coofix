import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { QueryError } from "./query-error";

export interface ColumnMeta {
  className?: string;
  headClassName?: string;
}

/**
 * Server-driven table: data is one page from the API; pagination/filters live in the URL.
 * Columns can set `meta.className` (e.g. "hidden md:table-cell") for responsive density.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
  page,
  perPage,
  total,
  onPage,
  onRowClick,
  getRowId,
  empty,
  skeletonRows = 8,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[] | undefined;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  page?: number;
  perPage?: number;
  total?: number;
  onPage?: (p: number) => void;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
  empty?: { icon?: LucideIcon; title: ReactNode; description?: ReactNode; action?: ReactNode };
  skeletonRows?: number;
}) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId,
  });

  if (error && !data) return <QueryError error={error} onRetry={onRetry} />;

  return (
    <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-70")}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => {
                const meta = h.column.columnDef.meta as ColumnMeta | undefined;
                return (
                  <TableHead key={h.id} className={cn(meta?.className, meta?.headClassName)} style={{ width: h.column.columnDef.size !== 150 ? h.column.columnDef.size : undefined }}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((c, j) => (
                    <TableCell key={j} className={(c.meta as ColumnMeta | undefined)?.className}>
                      <Skeleton className={cn("h-4", j === 0 ? "w-40" : "w-16")} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as ColumnMeta | undefined)?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!isLoading && data && data.length === 0 && empty && <EmptyState {...empty} />}
      {page !== undefined && perPage !== undefined && total !== undefined && onPage && total > 0 && (
        <Pagination page={page} perPage={perPage} total={total} onPage={onPage} />
      )}
    </div>
  );
}

/** Stops row-click navigation for interactive cells (switches, menus). */
export function StopPropagation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
