import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  FolderTreeIcon,
  ImageIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api, ApiError, fieldErrors } from "@/api/client";
import { qk, useCategories, useDeleteCategory, useSaveCategory } from "@/api/hooks";
import type { Category, CategoryInput } from "@/api/types";
import { CategorySelect } from "@/components/common/category-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { FormField } from "@/components/common/form-field";
import { SingleImageUpload } from "@/components/common/image-upload";
import { LocaleTabs } from "@/components/common/locale-tabs";
import { PageHeader } from "@/components/common/page-header";
import { QueryError } from "@/components/common/query-error";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { t } from "@/i18n/ru";
import { buildTree, type CategoryNode } from "@/lib/category-tree";
import { SLUG_RE } from "@/lib/slug";
import { cn } from "@/lib/utils";

type EditorState = { mode: "create"; parentId: number | null } | { mode: "edit"; cat: Category } | null;

export default function CategoriesPage() {
  const q = useCategories();
  const del = useDeleteCategory();
  const qc = useQueryClient();
  const [editor, setEditor] = useState<EditorState>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [reordering, setReordering] = useState(false);

  const tree = useMemo(() => buildTree(q.data ?? []), [q.data]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return tree;
    const match = (n: CategoryNode): CategoryNode | null => {
      const kids = n.children.map(match).filter((x): x is CategoryNode => x !== null);
      const self = (n.cat.name.ru ?? "").toLowerCase().includes(s) || n.cat.slug.includes(s);
      return self || kids.length ? { ...n, children: kids } : null;
    };
    return tree.map(match).filter((x): x is CategoryNode => x !== null);
  }, [tree, search]);

  const allIds = useMemo(() => (q.data ?? []).map((c) => c.id), [q.data]);
  const toggle = (id: number) =>
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  /** Move within siblings: renumber sort_order 0,10,20… and PATCH only the changed ones. */
  const move = async (siblings: CategoryNode[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= siblings.length) return;
    const order = siblings.map((n) => n.cat);
    [order[index], order[j]] = [order[j]!, order[index]!];
    const changes = order.map((c, i) => ({ c, sort: i * 10 })).filter(({ c, sort }) => c.sort_order !== sort);
    setReordering(true);
    try {
      await Promise.all(changes.map(({ c, sort }) => api<Category>(`/admin/categories/${c.id}`, { method: "PATCH", body: { sort_order: sort } })));
      toast.success(t.categories.moved);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.userMessage : t.errors.generic);
    } finally {
      await qc.invalidateQueries({ queryKey: qk.categories });
      setReordering(false);
    }
  };

  const renderNodes = (nodes: CategoryNode[]) =>
    nodes.map((n, i) => {
      const open = !collapsed.has(n.cat.id) || !!search;
      const hasKids = n.children.length > 0;
      return (
        <li key={n.cat.id}>
          <div
            className="group flex items-center gap-2 border-b py-1.5 pr-3 hover:bg-muted/40"
            style={{ paddingLeft: 12 + n.depth * 22 }}
          >
            <button
              type="button"
              className={cn("flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent", !hasKids && "invisible")}
              onClick={() => toggle(n.cat.id)}
              aria-label={open ? t.nav.collapse : t.nav.expand}
              aria-expanded={open}
            >
              <ChevronRightIcon className={cn("size-4 transition-transform", open && "rotate-90")} />
            </button>
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted/40">
              {n.cat.image_url ? <img src={n.cat.image_url} alt="" className="size-full object-cover" /> : <ImageIcon className="size-3.5 text-muted-foreground" />}
            </div>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditor({ mode: "edit", cat: n.cat })}>
              <div className="flex items-center gap-2">
                <span className={cn("truncate font-medium", !n.cat.is_active && "text-muted-foreground")}>{n.cat.name.ru}</span>
                {!n.cat.is_active && (
                  <Badge variant="muted">
                    <EyeOffIcon />
                    {t.categories.hidden}
                  </Badge>
                )}
                {hasKids && <span className="text-xs text-muted-foreground tabular">{n.children.length}</span>}
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">/{n.cat.slug}</div>
            </button>
            <span className="hidden w-10 text-right text-xs text-muted-foreground tabular sm:inline" title={t.categories.sortOrder}>
              {n.cat.sort_order}
            </span>
            {!search && (
              <div className="flex opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <Button variant="ghost" size="icon-xs" disabled={i === 0 || reordering} onClick={() => void move(nodes, i, -1)} aria-label={t.common.moveUp}>
                  <ArrowUpIcon />
                </Button>
                <Button variant="ghost" size="icon-xs" disabled={i === nodes.length - 1 || reordering} onClick={() => void move(nodes, i, 1)} aria-label={t.common.moveDown}>
                  <ArrowDownIcon />
                </Button>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label={t.common.actions}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditor({ mode: "edit", cat: n.cat })}>
                  <PencilIcon />
                  {t.common.edit}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEditor({ mode: "create", parentId: n.cat.id })}>
                  <PlusIcon />
                  {t.categories.addChild}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(n.cat)}>
                  <Trash2Icon />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasKids && open && <ul>{renderNodes(n.children)}</ul>}
        </li>
      );
    });

  return (
    <>
      <PageHeader
        title={t.categories.title}
        description={q.data ? `${t.common.total}: ${q.data.length}` : t.categories.subtitle}
        actions={
          <Button onClick={() => setEditor({ mode: "create", parentId: null })}>
            <PlusIcon />
            {t.categories.new}
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <SearchInput value={search} onChange={setSearch} placeholder={t.categories.searchPlaceholder} className="w-full sm:w-64" />
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(new Set())}>
              <ChevronsUpDownIcon />
              <span className="hidden sm:inline">{t.categories.expandAll}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(new Set(allIds))}>
              <ChevronsDownUpIcon />
              <span className="hidden sm:inline">{t.categories.collapseAll}</span>
            </Button>
          </div>
        </div>
        {q.isLoading ? (
          <div className="grid gap-2 p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10" style={{ marginLeft: (i % 3) * 22 }} />
            ))}
          </div>
        ) : q.error ? (
          <QueryError error={q.error} onRetry={() => void q.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderTreeIcon}
            title={search ? t.palette.empty : t.categories.empty}
            description={search ? undefined : t.categories.emptyHint}
          />
        ) : (
          <ul className={cn("-mb-px", reordering && "pointer-events-none opacity-70")}>{renderNodes(filtered)}</ul>
        )}
      </Card>

      <CategoryEditor state={editor} categories={q.data ?? []} onClose={() => setEditor(null)} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t.categories.deleteTitle}
        description={
          <>
            <span className="font-medium text-foreground">{toDelete?.name.ru}</span>. {t.categories.deleteText}
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

// ---------- editor ----------

const v = t.validation;
const i18nShort = z.object({ ru: z.string().max(300), zh: z.string().max(300) });
const schema = z.object({
  name: z.object({ ru: z.string().trim().min(1, v.required).max(300, v.max(300)), zh: z.string().max(300) }),
  slug: z.string().trim().max(120).refine((s) => s === "" || SLUG_RE.test(s), v.slug),
  parent_id: z.number().nullable(),
  description: z.object({ ru: z.string().max(20000), zh: z.string().max(20000) }),
  image_url: z.string().nullable(),
  sort_order: z.string().trim().regex(/^-?\d{1,5}$/, v.int),
  is_active: z.boolean(),
  seo: z.object({ title: i18nShort, description: i18nShort }),
});
type Values = z.infer<typeof schema>;

const i18n = (o?: { ru?: string; zh?: string }) => ({ ru: o?.ru ?? "", zh: o?.zh ?? "" });
const clean = (o: { ru: string; zh: string }) => Object.fromEntries(Object.entries(o).filter(([, s]) => s.trim()).map(([k, s]) => [k, s.trim()]));

function toForm(c: Category | undefined, parentId: number | null, siblings: number): Values {
  return {
    name: i18n(c?.name),
    slug: c?.slug ?? "",
    parent_id: c ? c.parent_id : parentId,
    description: i18n(c?.description),
    image_url: c?.image_url ?? null,
    sort_order: String(c?.sort_order ?? siblings * 10),
    is_active: c?.is_active ?? true,
    seo: { title: i18n(c?.seo.title), description: i18n(c?.seo.description) },
  };
}

function CategoryEditor({ state, categories, onClose }: { state: EditorState; categories: Category[]; onClose: () => void }) {
  return (
    <Sheet open={!!state} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-lg">
        {state && (
          <CategoryForm
            key={state.mode === "edit" ? state.cat.id : `new-${state.parentId}`}
            cat={state.mode === "edit" ? state.cat : undefined}
            parentId={state.mode === "create" ? state.parentId : null}
            categories={categories}
            onDone={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function CategoryForm({ cat, parentId, categories, onDone }: { cat?: Category; parentId: number | null; categories: Category[]; onDone: () => void }) {
  const save = useSaveCategory();
  const siblings = categories.filter((c) => c.parent_id === parentId).length;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toForm(cat, parentId, siblings) });
  const { register, control, formState, handleSubmit, setError } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (f) => {
    const data: Partial<CategoryInput> = {
      name: clean(f.name),
      parent_id: f.parent_id,
      description: clean(f.description),
      image_url: f.image_url,
      sort_order: Number(f.sort_order),
      is_active: f.is_active,
      seo: { title: clean(f.seo.title), description: clean(f.seo.description) },
    };
    if (f.slug) data.slug = f.slug;
    try {
      await save.mutateAsync({ id: cat?.id, data });
      toast.success(cat ? t.common.saved : t.common.created);
      onDone();
    } catch (e) {
      if (!(e instanceof ApiError)) return;
      if (e.code === "slug_taken" || e.code === "invalid_slug") setError("slug", { message: e.userMessage });
      else if (e.code === "category_cycle") setError("parent_id", { message: e.userMessage });
      for (const [path, msg] of Object.entries(fieldErrors(e))) {
        const root = path.split(".")[0];
        if (root === "name") setError("name.ru", { message: msg });
        else if (root === "slug" || root === "sort_order" || root === "image_url" || root === "parent_id") setError(root, { message: msg });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col" noValidate>
      <SheetHeader>
        <SheetTitle>{cat ? t.categories.editTitle : t.categories.createTitle}</SheetTitle>
        {cat && <SheetDescription className="font-mono">/{cat.slug}</SheetDescription>}
      </SheetHeader>
      <div className="grid flex-1 content-start gap-4 overflow-y-auto px-5 py-4">
        <LocaleTabs errorLocales={errors.name?.ru ? ["ru"] : undefined}>
          {(l) => (
            <FormField label={t.categories.name} required={l === "ru"} error={errors.name?.[l]?.message}>
              <Input {...register(`name.${l}`)} maxLength={300} autoFocus={l === "ru"} />
            </FormField>
          )}
        </LocaleTabs>
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <FormField label={t.categories.slug} error={errors.slug?.message} hint={t.products.slugHint}>
            <Input {...register("slug")} className="font-mono text-[13px]" />
          </FormField>
          <FormField label={t.categories.sortOrder} error={errors.sort_order?.message} hint={t.categories.sortHint}>
            <Input {...register("sort_order")} inputMode="numeric" className="tabular" />
          </FormField>
        </div>
        <FormField label={t.categories.parent} error={errors.parent_id?.message}>
          <Controller
            control={control}
            name="parent_id"
            render={({ field }) => <CategorySelect categories={categories} value={field.value} onChange={field.onChange} allowNone exclude={cat?.id} />}
          />
        </FormField>
        <FormField label={t.categories.image} error={errors.image_url?.message}>
          <Controller control={control} name="image_url" render={({ field }) => <SingleImageUpload value={field.value} onChange={field.onChange} />} />
        </FormField>
        <LocaleTabs>
          {(l) => (
            <FormField label={t.categories.description}>
              <Textarea {...register(`description.${l}`)} rows={4} />
            </FormField>
          )}
        </LocaleTabs>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Label className="cursor-pointer justify-between rounded-md border px-3 py-2.5 font-normal">
              {t.categories.isActive}
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Label>
          )}
        />
        <LocaleTabs>
          {(l) => (
            <div className="grid gap-4">
              <FormField label={t.categories.seoTitle}>
                <Input {...register(`seo.title.${l}`)} maxLength={300} />
              </FormField>
              <FormField label={t.categories.seoDescription}>
                <Textarea {...register(`seo.description.${l}`)} maxLength={300} rows={3} />
              </FormField>
            </div>
          )}
        </LocaleTabs>
      </div>
      <div className="flex justify-end gap-2 border-t px-5 py-3">
        <Button variant="outline" onClick={onDone}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {cat ? t.common.save : t.common.create}
        </Button>
      </div>
    </form>
  );
}
