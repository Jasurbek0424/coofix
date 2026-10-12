import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ExternalLinkIcon, Loader2Icon, PackageMinusIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useBlocker, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, fieldErrors } from "@/api/client";
import { useBrands, useCategories, useDeleteProduct, useProduct, useSaveProduct } from "@/api/hooks";
import type { Product, ProductInput } from "@/api/types";
import { CategorySelect } from "@/components/common/category-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { FormField } from "@/components/common/form-field";
import { ImageGalleryUpload } from "@/components/common/image-upload";
import { fromRows, hasDuplicateKeys, KeyValueEditor, type KVRow, toRows } from "@/components/common/key-value-editor";
import { LocaleTabs } from "@/components/common/locale-tabs";
import { MoneyInput } from "@/components/common/money-input";
import { QueryError } from "@/components/common/query-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/i18n/ru";
import { storeProductUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { isValidMoney, minorToInput, rublesToMinor } from "@/lib/money";
import { SLUG_RE, slugify } from "@/lib/slug";
import { StockBadge } from "./products-list";
import { StockAdjustDialog } from "./stock-adjust-dialog";

const v = t.validation;
const i18nOptional = z.object({ ru: z.string().max(20000), zh: z.string().max(20000) });
const i18nShort = z.object({ ru: z.string().max(300), zh: z.string().max(300) });
const money = z.string().trim().refine((s) => s === "" || (isValidMoney(s) && rublesToMinor(s) !== null), v.money);

const schema = z
  .object({
    name: z.object({ ru: z.string().trim().min(1, v.required).max(300, v.max(300)), zh: z.string().max(300) }),
    slug: z.string().trim().max(120, v.max(120)).refine((s) => s === "" || SLUG_RE.test(s), v.slug),
    sku: z
      .string()
      .trim()
      .max(64, v.max(64))
      .refine((s) => s === "" || /^[\w\-./]+$/.test(s), v.sku),
    category_id: z.number({ error: v.required }).nullable().refine((x): boolean => x !== null, v.required),
    brand_id: z.number().nullable(),
    price: money.refine((s) => s !== "", v.required),
    old_price: money,
    stock: z.string().trim().regex(/^\d{0,7}$/, v.int),
    images: z.array(z.object({ url: z.string(), alt: z.string().nullable() })).max(20),
    attributes: z.array(z.object({ id: z.string(), key: z.string().max(100), value: z.string().max(500) })).refine((rows) => !hasDuplicateKeys(rows), t.attributes.duplicate),
    description: i18nOptional,
    seo: z.object({ title: i18nShort, description: i18nShort }),
    is_active: z.boolean(),
    is_new: z.boolean(),
    is_hit: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const p = rublesToMinor(val.price);
    const o = val.old_price ? rublesToMinor(val.old_price) : null;
    if (p !== null && o !== null && o <= p) ctx.addIssue({ code: "custom", path: ["old_price"], message: v.oldPrice });
  });

type FormValues = z.infer<typeof schema>;

const i18n = (o: { ru?: string; zh?: string } | undefined) => ({ ru: o?.ru ?? "", zh: o?.zh ?? "" });

function toForm(p?: Product): FormValues {
  return {
    name: i18n(p?.name),
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    category_id: p?.category_id ?? null,
    brand_id: p?.brand_id ?? null,
    price: minorToInput(p?.price_minor),
    old_price: minorToInput(p?.old_price_minor),
    stock: p ? String(p.stock) : "0",
    images: p?.images.map((i) => ({ url: i.url, alt: i.alt ?? null })) ?? [],
    attributes: toRows(p?.attributes as Record<string, string> | undefined),
    description: i18n(p?.description),
    seo: { title: i18n(p?.seo.title), description: i18n(p?.seo.description) },
    is_active: p?.is_active ?? true,
    is_new: p?.is_new ?? false,
    is_hit: p?.is_hit ?? false,
  };
}

/** Drop empty translations so the payload stays clean. */
const clean = (o: { ru: string; zh: string }) => Object.fromEntries(Object.entries(o).filter(([, s]) => s.trim() !== "").map(([k, s]) => [k, s.trim()]));

function toPayload(f: FormValues, isCreate: boolean): Partial<ProductInput> {
  const out: Partial<ProductInput> = {
    name: clean(f.name),
    sku: f.sku || null,
    category_id: f.category_id!,
    brand_id: f.brand_id,
    price_minor: rublesToMinor(f.price)!,
    old_price_minor: f.old_price ? rublesToMinor(f.old_price) : null,
    images: f.images.map((i) => ({ url: i.url, alt: i.alt?.trim() || null })),
    attributes: fromRows(f.attributes as KVRow[]),
    description: clean(f.description),
    seo: { title: clean(f.seo.title), description: clean(f.seo.description) },
    is_active: f.is_active,
    is_new: f.is_new,
    is_hit: f.is_hit,
  };
  if (f.slug) out.slug = f.slug;
  if (isCreate) out.stock = Number(f.stock || "0");
  return out;
}

/** Only changed top-level keys go into PATCH — keeps the audit log meaningful. */
function diff(next: Partial<ProductInput>, prev: Partial<ProductInput>): Partial<ProductInput> {
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(next)) {
    if (JSON.stringify(val) !== JSON.stringify((prev as Record<string, unknown>)[k])) out[k] = val;
  }
  return out as Partial<ProductInput>;
}

const SERVER_FIELD: Record<string, keyof FormValues | `${string}.${string}`> = {
  name: "name.ru",
  price_minor: "price",
  old_price_minor: "old_price",
  category_id: "category_id",
  brand_id: "brand_id",
  slug: "slug",
  sku: "sku",
  images: "images",
  attributes: "attributes",
  stock: "stock",
};

export default function ProductEditPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : undefined;
  const isCreate = id === undefined;
  const q = useProduct(id);

  if (!isCreate && Number.isNaN(id)) return <EmptyState title={t.products.notFound} />;
  if (!isCreate && q.isLoading) return <FormSkeleton />;
  if (!isCreate && q.error) {
    return q.error instanceof ApiError && q.error.status === 404 ? (
      <EmptyState title={t.products.notFound} action={<BackButton />} />
    ) : (
      <QueryError error={q.error} onRetry={() => void q.refetch()} />
    );
  }
  // Remount the form when switching product (key) so defaults reset cleanly.
  return <ProductForm key={id ?? "new"} product={q.data} />;
}

function BackButton() {
  return (
    <Button asChild variant="ghost" size="icon-sm" className="mt-0.5" aria-label={t.common.back}>
      <Link to="/products">
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
}

function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const isCreate = !product;
  const cats = useCategories();
  const brands = useBrands();
  const save = useSaveProduct();
  const del = useDeleteProduct();
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(product), mode: "onTouched" });
  const { register, control, formState, setError, reset, handleSubmit } = form;
  const { errors, isDirty, isSubmitting } = formState;

  const name = useWatch({ control, name: "name.ru" });
  const slugAuto = slugify(name ?? "");

  // Set right before programmatic navigation after save/delete (form state updates are async).
  const allowLeave = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => !allowLeave.current && isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // eslint-disable-next-line react-hooks/refs -- ref is only read inside the async submit handler, not during render
  const onSubmit = handleSubmit(async (values) => {
    const payload = toPayload(values, isCreate);
    const body = isCreate ? payload : diff(payload, toPayload(toForm(product), false));
    if (!isCreate && Object.keys(body).length === 0) {
      reset(values);
      return;
    }
    try {
      const saved = await save.mutateAsync({ id: product?.id, data: body });
      toast.success(isCreate ? t.common.created : t.common.saved);
      reset(toForm(saved));
      if (isCreate) {
        allowLeave.current = true;
        void navigate(`/products/${saved.id}`, { replace: true });
      }
    } catch (e) {
      applyServerErrors(e);
    }
  });

  function applyServerErrors(e: unknown) {
    if (!(e instanceof ApiError)) return;
    const byCode: Record<string, keyof FormValues> = { slug_taken: "slug", sku_taken: "sku", invalid_old_price: "old_price", invalid_slug: "slug" };
    const target = byCode[e.code];
    if (target) {
      setError(target, { message: e.userMessage }, { shouldFocus: true });
      return;
    }
    const fe = fieldErrors(e);
    let focused = false;
    for (const [path, msg] of Object.entries(fe)) {
      const root = path.split(".")[0] ?? "";
      const field = SERVER_FIELD[root];
      if (/old_price/.test(msg) || (root === "" && /old_price/.test(path))) {
        setError("old_price", { message: t.validation.oldPrice });
        continue;
      }
      if (field) {
        setError(field as keyof FormValues, { message: msg }, { shouldFocus: !focused });
        focused = true;
      }
    }
    if (e.code === "validation_error" && Object.keys(fe).length === 0) toast.error(e.userMessage);
    else if (e.code === "validation_error") toast.error(t.errors.validation_error);
  }

  const title = isCreate ? t.products.createTitle : product.name.ru;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="sticky top-13 z-20 -mx-3 mb-5 flex flex-wrap items-center gap-2 border-b bg-background/90 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <BackButton />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {product && (
            <p className="truncate text-xs text-muted-foreground">
              ID {product.id} · {t.products.colUpdated.toLowerCase()} {formatDateTime(product.updated_at)}
            </p>
          )}
        </div>
        {isDirty && <span className="hidden text-xs text-muted-foreground md:inline">{t.common.unsaved}</span>}
        {product && (
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <a href={storeProductUrl(product.slug)} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              {t.products.openOnSite}
            </a>
          </Button>
        )}
        {product && (
          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setDeleteOpen(true)} aria-label={t.common.delete}>
            <Trash2Icon />
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || (!isCreate && !isDirty)}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {isSubmitting ? t.common.saving : isCreate ? t.common.create : t.common.save}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionMain}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <LocaleTabs errorLocales={errors.name?.ru ? ["ru"] : undefined}>
                {(l) => (
                  <FormField label={t.products.name} required={l === "ru"} error={errors.name?.[l]?.message}>
                    <Input {...register(`name.${l}`)} maxLength={300} />
                  </FormField>
                )}
              </LocaleTabs>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t.products.slug} error={errors.slug?.message} hint={t.products.slugHint}>
                  <Input {...register("slug")} placeholder={slugAuto || "product-slug"} className="font-mono text-[13px]" />
                </FormField>
                <FormField label={t.products.sku} error={errors.sku?.message}>
                  <Input {...register("sku")} className="font-mono text-[13px]" />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t.products.category} required error={errors.category_id?.message}>
                  <Controller
                    control={control}
                    name="category_id"
                    render={({ field }) => <CategorySelect categories={cats.data} value={field.value} onChange={field.onChange} />}
                  />
                </FormField>
                <FormField label={t.products.brand} error={errors.brand_id?.message}>
                  <Controller
                    control={control}
                    name="brand_id"
                    render={({ field }) => (
                      <Select value={field.value != null ? String(field.value) : "none"} onValueChange={(x) => field.onChange(x === "none" ? null : Number(x))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.products.noBrand}</SelectItem>
                          {brands.data?.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                              {!b.is_active && ` (${t.common.inactive.toLowerCase()})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionMedia}</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="images"
                render={({ field }) => <ImageGalleryUpload value={field.value} onChange={field.onChange} />}
              />
              {errors.images && <p className="mt-2 text-xs text-destructive">{errors.images.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionDescription}</CardTitle>
            </CardHeader>
            <CardContent>
              <LocaleTabs>
                {(l) => (
                  <FormField error={errors.description?.[l]?.message}>
                    <Textarea {...register(`description.${l}`)} rows={8} aria-label={t.products.description} />
                  </FormField>
                )}
              </LocaleTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionAttributes}</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="attributes"
                render={({ field }) => <KeyValueEditor value={field.value} onChange={field.onChange} />}
              />
              {errors.attributes?.message && <p className="mt-2 text-xs text-destructive">{errors.attributes.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionSeo}</CardTitle>
            </CardHeader>
            <CardContent>
              <LocaleTabs>
                {(l) => (
                  <div className="grid gap-4">
                    <FormField label={t.products.seoTitle} error={errors.seo?.title?.[l]?.message}>
                      <Input {...register(`seo.title.${l}`)} maxLength={300} placeholder={l === "ru" ? name : undefined} />
                    </FormField>
                    <FormField label={t.products.seoDescription} error={errors.seo?.description?.[l]?.message}>
                      <Textarea {...register(`seo.description.${l}`)} maxLength={300} rows={3} />
                    </FormField>
                  </div>
                )}
              </LocaleTabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4 lg:sticky lg:top-32">
          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionFlags}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(["is_active", "is_new", "is_hit"] as const).map((k) => (
                <Controller
                  key={k}
                  control={control}
                  name={k}
                  render={({ field }) => (
                    <Label className="cursor-pointer justify-between font-normal">
                      {k === "is_active" ? t.products.isActive : k === "is_new" ? t.products.isNew : t.products.isHit}
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </Label>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.sectionPrice}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField label={t.products.price} required error={errors.price?.message}>
                <MoneyInput {...register("price")} placeholder="0" />
              </FormField>
              <FormField label={t.products.oldPrice} error={errors.old_price?.message} hint={t.products.oldPriceHint}>
                <MoneyInput {...register("old_price")} />
              </FormField>
              {isCreate ? (
                <FormField label={t.products.stock} error={errors.stock?.message}>
                  <Input {...register("stock")} inputMode="numeric" className="tabular" />
                </FormField>
              ) : (
                <div className="grid gap-1.5">
                  <Label>{t.products.stockCurrent}</Label>
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold tabular">{product.stock}</span>
                      <StockBadge stock={product.stock} />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStockOpen(true)}>
                      <PackageMinusIcon />
                      {t.products.adjustStock}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {product && product.rating_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.products.rating}</CardTitle>
                <CardDescription>
                  ★ {product.rating_avg} · {product.rating_count}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>

      {product && <StockAdjustDialog open={stockOpen} onOpenChange={setStockOpen} product={product} />}
      {product && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t.products.deleteTitle}
          description={t.products.deleteText}
          onConfirm={async () => {
            await del.mutateAsync(product.id);
            toast.success(t.common.deleted);
            allowLeave.current = true;
            void navigate("/products", { replace: true });
          }}
        />
      )}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(o) => !o && blocker.state === "blocked" && blocker.reset()}
        title={t.common.leaveTitle}
        description={t.common.leaveText}
        confirmLabel={t.common.leave}
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </form>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
