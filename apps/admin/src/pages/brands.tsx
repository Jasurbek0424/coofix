import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2Icon, MoreHorizontalIcon, PencilIcon, PlusIcon, TagIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, fieldErrors } from "@/api/client";
import { useBrands, useDeleteBrand, useSaveBrand } from "@/api/hooks";
import type { Brand, BrandInput } from "@/api/types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, StopPropagation } from "@/components/common/data-table";
import { FormField } from "@/components/common/form-field";
import { SingleImageUpload } from "@/components/common/image-upload";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { t } from "@/i18n/ru";
import { formatDate } from "@/lib/format";
import { SLUG_RE } from "@/lib/slug";

type EditorState = { brand?: Brand } | null;

export default function BrandsPage() {
  const q = useBrands();
  const del = useDeleteBrand();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [toDelete, setToDelete] = useState<Brand | null>(null);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter((b) => !s || b.name.toLowerCase().includes(s) || b.slug.includes(s));
  }, [q.data, search]);

  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      {
        id: "name",
        header: t.brands.name,
        cell: ({ row: { original: b } }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white">
              {b.logo_url ? <img src={b.logo_url} alt="" className="size-full object-contain p-0.5" /> : <TagIcon className="size-4 text-muted-foreground" />}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{b.name}</div>
              <div className="truncate font-mono text-xs text-muted-foreground">{b.slug}</div>
            </div>
          </div>
        ),
      },
      {
        id: "active",
        header: t.brands.isActive,
        cell: ({ row }) => (row.original.is_active ? <Badge variant="success">{t.common.active}</Badge> : <Badge variant="muted">{t.common.inactive}</Badge>),
      },
      {
        id: "created",
        header: t.brands.colCreated,
        meta: { className: "hidden sm:table-cell text-muted-foreground" },
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{t.common.actions}</span>,
        size: 48,
        cell: ({ row: { original: b } }) => (
          <StopPropagation className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label={t.common.actions}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditor({ brand: b })}>
                  <PencilIcon />
                  {t.common.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(b)}>
                  <Trash2Icon />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </StopPropagation>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title={t.brands.title}
        description={q.data ? `${t.common.total}: ${q.data.length}` : t.brands.subtitle}
        actions={
          <Button onClick={() => setEditor({})}>
            <PlusIcon />
            {t.brands.new}
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="border-b p-3">
          <SearchInput value={search} onChange={setSearch} placeholder={t.brands.searchPlaceholder} className="w-full sm:w-64" />
        </div>
        <DataTable
          columns={columns}
          data={q.data ? rows : undefined}
          isLoading={q.isLoading}
          error={q.error}
          onRetry={() => void q.refetch()}
          onRowClick={(b) => setEditor({ brand: b })}
          getRowId={(b) => String(b.id)}
          empty={{ icon: TagIcon, title: search ? t.palette.empty : t.brands.empty, description: search ? undefined : t.brands.emptyHint }}
        />
      </Card>

      <Dialog open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
        <DialogContent>{editor && <BrandForm key={editor.brand?.id ?? "new"} brand={editor.brand} onDone={() => setEditor(null)} />}</DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t.brands.deleteTitle}
        description={
          <>
            <span className="font-medium text-foreground">{toDelete?.name}</span>. {t.brands.deleteText}
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

const schema = z.object({
  name: z.string().trim().min(1, t.validation.required).max(120, t.validation.max(120)),
  slug: z.string().trim().max(120).refine((s) => s === "" || SLUG_RE.test(s), t.validation.slug),
  logo_url: z.string().nullable(),
  is_active: z.boolean(),
});
type Values = z.infer<typeof schema>;

function BrandForm({ brand, onDone }: { brand?: Brand; onDone: () => void }) {
  const save = useSaveBrand();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: brand?.name ?? "", slug: brand?.slug ?? "", logo_url: brand?.logo_url ?? null, is_active: brand?.is_active ?? true },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (f) => {
    const data: Partial<BrandInput> = { name: f.name, logo_url: f.logo_url, is_active: f.is_active };
    if (f.slug) data.slug = f.slug;
    try {
      await save.mutateAsync({ id: brand?.id, data });
      toast.success(brand ? t.common.saved : t.common.created);
      onDone();
    } catch (e) {
      if (!(e instanceof ApiError)) return;
      if (e.code === "slug_taken") form.setError("slug", { message: e.userMessage });
      for (const [path, msg] of Object.entries(fieldErrors(e))) {
        const root = path.split(".")[0];
        if (root === "name" || root === "slug" || root === "logo_url") form.setError(root, { message: msg });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>{brand ? t.brands.editTitle : t.brands.createTitle}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <FormField label={t.brands.logo} error={errors.logo_url?.message}>
          <Controller
            control={form.control}
            name="logo_url"
            render={({ field }) => <SingleImageUpload value={field.value} onChange={field.onChange} aspect="aspect-square" />}
          />
        </FormField>
        <div className="grid content-start gap-4">
          <FormField label={t.brands.name} required error={errors.name?.message}>
            <Input {...form.register("name")} autoFocus maxLength={120} />
          </FormField>
          <FormField label={t.brands.slug} error={errors.slug?.message} hint={t.products.slugHint}>
            <Input {...form.register("slug")} className="font-mono text-[13px]" />
          </FormField>
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <Label className="cursor-pointer justify-between font-normal">
                {t.brands.isActive}
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </Label>
            )}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {brand ? t.common.save : t.common.create}
        </Button>
      </DialogFooter>
    </form>
  );
}
