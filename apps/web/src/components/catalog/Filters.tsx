"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { Brand } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { t, tp } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { Checkbox, Switch } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";

interface Props {
  brands: Brand[];
  /** Bounds from the API, in kopecks. */
  priceMin: number;
  priceMax: number;
  total: number;
}

function useUpdateParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    p.delete("page");
    const s = p.toString();
    start(() => router.push(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  };
  return { sp, update, pending };
}

const FLAGS = [
  { key: "in_stock", label: "catalog.inStock" },
  { key: "on_sale", label: "catalog.onSale" },
  { key: "is_new", label: "catalog.isNew" },
  { key: "is_hit", label: "catalog.isHit" },
] as const;

function FilterPanel({ brands, priceMin, priceMax }: Omit<Props, "total">) {
  const { sp, update, pending } = useUpdateParams();
  const lo = Math.floor(priceMin / 100);
  const hi = Math.ceil(priceMax / 100);
  const [min, setMin] = useState(sp.get("price_min") ?? "");
  const [max, setMax] = useState(sp.get("price_max") ?? "");
  const [allBrands, setAllBrands] = useState(false);
  const selected = sp.getAll("brand");

  // Sync inputs when URL changes externally (reset, back/forward).
  const urlMin = sp.get("price_min") ?? "";
  const urlMax = sp.get("price_max") ?? "";
  const [prevUrl, setPrevUrl] = useState(`${urlMin}|${urlMax}`);
  if (prevUrl !== `${urlMin}|${urlMax}`) {
    setPrevUrl(`${urlMin}|${urlMax}`);
    setMin(urlMin);
    setMax(urlMax);
  }

  const applyPrice = () => {
    if (min === urlMin && max === urlMax) return;
    update((p) => {
      const set = (k: string, v: string) => (v && Number(v) > 0 ? p.set(k, String(Math.floor(Number(v)))) : p.delete(k));
      set("price_min", min);
      set("price_max", max);
    });
  };

  const shownBrands = allBrands ? brands : brands.slice(0, 8);

  return (
    <div className={cn("space-y-7 transition-opacity", pending && "opacity-60")} aria-busy={pending}>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t("catalog.price")}</legend>
        <div className="flex items-center gap-2">
          {[
            { v: min, set: setMin, ph: lo, label: t("catalog.priceMinLabel"), pre: t("catalog.priceFrom") },
            { v: max, set: setMax, ph: hi, label: t("catalog.priceMaxLabel"), pre: t("catalog.priceTo") },
          ].map((f) => (
            <label key={f.label} className="relative flex-1">
              <span className="sr-only">{f.label}</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted" aria-hidden="true">{f.pre}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={f.v}
                placeholder={f.ph ? String(f.ph) : ""}
                onChange={(e) => f.set(e.target.value)}
                onBlur={applyPrice}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-8 pr-2 text-sm tabular focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("catalog.special")}</legend>
        {FLAGS.map((f) => (
          <Switch
            key={f.key}
            label={t(f.label)}
            checked={sp.get(f.key) === "1"}
            onChange={(e) => update((p) => (e.target.checked ? p.set(f.key, "1") : p.delete(f.key)))}
          />
        ))}
      </fieldset>

      {brands.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t("catalog.brands")}</legend>
          {shownBrands.map((b) => (
            <Checkbox
              key={b.id}
              label={b.name}
              checked={selected.includes(b.slug)}
              onChange={(e) =>
                update((p) => {
                  const next = e.target.checked ? [...selected, b.slug] : selected.filter((x) => x !== b.slug);
                  p.delete("brand");
                  next.forEach((x) => p.append("brand", x));
                })
              }
            />
          ))}
          {brands.length > 8 && (
            <button type="button" onClick={() => setAllBrands((v) => !v)} className="mt-1 text-sm font-semibold text-brand-text hover:underline">
              {allBrands ? t("catalog.showLessBrands") : t("catalog.showMoreBrands")}
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
}

export function FiltersSidebar(props: Omit<Props, "total">) {
  return (
    <aside className="hidden lg:block" aria-label={t("catalog.filters")}>
      <div className="sticky top-28 rounded-xl border border-line bg-surface p-5">
        <FilterPanel {...props} />
        <ResetLink className="mt-6" />
      </div>
    </aside>
  );
}

function ResetLink({ className }: { className?: string }) {
  const { sp, update } = useUpdateParams();
  const active = ["brand", "price_min", "price_max", ...FLAGS.map((f) => f.key)].some((k) => sp.has(k));
  if (!active) return null;
  return (
    <Button
      variant="soft"
      size="sm"
      className={cn("w-full", className)}
      onClick={() => update((p) => ["brand", "price_min", "price_max", ...FLAGS.map((f) => f.key)].forEach((k) => p.delete(k)))}
    >
      <Icon name="close" className="size-4" />
      {t("catalog.resetFilters")}
    </Button>
  );
}

export function CatalogToolbar({ brands, priceMin, priceMax, total }: Props) {
  const { sp, update } = useUpdateParams();
  const [open, setOpen] = useState(false);
  const activeCount = ["price_min", "price_max", ...FLAGS.map((f) => f.key)].filter((k) => sp.has(k)).length + sp.getAll("brand").length;
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Button variant="outline" size="md" className="lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name="sliders" className="size-5" />
        {t("catalog.filters")}
        {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-on-brand">{activeCount}</span>}
      </Button>
      <p className="hidden text-sm text-muted lg:block" aria-live="polite">{tp("catalog.found", total)}</p>
      <label className="relative flex items-center">
        <span className="sr-only">{t("catalog.sort")}</span>
        <Icon name="sort" className="pointer-events-none absolute left-3 size-4 text-muted" />
        <select
          value={sp.get("sort") ?? "popular"}
          onChange={(e) => update((p) => (e.target.value === "popular" ? p.delete("sort") : p.set("sort", e.target.value)))}
          className="h-11 appearance-none rounded-lg border border-line-strong bg-surface pl-9 pr-9 text-sm font-medium focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        >
          {(["popular", "new", "price_asc", "price_desc", "name"] as const).map((s) => (
            <option key={s} value={s}>{t(`catalog.sortOptions.${s}`)}</option>
          ))}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 size-4 text-muted" />
      </label>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title={t("catalog.filters")}
        footer={
          <div className="flex gap-3">
            <ResetLink className="h-12 w-auto flex-1" />
            <Button size="lg" className="flex-[2]" onClick={() => setOpen(false)}>
              {t("catalog.showResults")} · {total}
            </Button>
          </div>
        }
      >
        <div className="p-5">
          <FilterPanel brands={brands} priceMin={priceMin} priceMax={priceMax} />
        </div>
      </Sheet>
    </div>
  );
}
