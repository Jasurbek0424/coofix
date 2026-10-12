"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { fetchProducts } from "@/lib/api/queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/product/ProductImage";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/** Header search: ARIA 1.2 combobox with debounced product suggestions. */
export function SearchBox({ className, autoFocus, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = pathname === "/search" ? (params.get("q") ?? "") : "";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync when navigating between search result pages.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setValue(initial);
  }

  const q = useDebounced(value.trim(), 250);
  const enabled = q.length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ["suggest", q],
    queryFn: ({ signal }) => fetchProducts({ q, per_page: 6 }, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const items = enabled ? (data?.items ?? []) : [];
  const total = enabled ? (data?.total ?? 0) : 0;
  const optionCount = items.length + (items.length ? 1 : 0); // + "all results"

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    const term = value.trim();
    if (term.length < 2) return;
    go(`/search?q=${encodeURIComponent(term)}`);
  };

  const showPanel = open && value.trim().length >= 2;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && active < items.length) go(`/product/${items[active]!.slug}`);
          else submit();
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t("header.searchLabel")}
        </label>
        <div className="group relative flex items-center">
          <Icon name="search" className="pointer-events-none absolute left-3.5 size-5 text-muted transition-colors group-focus-within:text-ink" />
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
            autoComplete="off"
            enterKeyHint="search"
            autoFocus={autoFocus}
            maxLength={100}
            placeholder={t("header.searchPlaceholder")}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActive((a) => (optionCount ? (a + 1) % optionCount : -1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => (optionCount ? (a <= 0 ? optionCount - 1 : a - 1) : -1));
              } else if (e.key === "Escape") {
                if (showPanel) {
                  e.preventDefault();
                  setOpen(false);
                  setActive(-1);
                }
              } else if (e.key === "Enter" && active === items.length && items.length) {
                e.preventDefault();
                submit();
              }
            }}
            className="h-11 w-full rounded-lg border border-transparent bg-surface-3 pl-11 pr-24 text-[15px] text-ink placeholder:text-muted transition-[background-color,border-color,box-shadow] hover:bg-line focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              className="absolute right-[4.6rem] grid size-8 place-items-center rounded-md text-muted hover:text-ink"
              aria-label={t("common.reset")}
            >
              <Icon name="close" className="size-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1 h-9 rounded-md bg-ink px-3.5 text-sm font-semibold text-bg transition-colors hover:bg-ink-2"
          >
            {t("header.searchSubmit")}
          </button>
        </div>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-lg animate-fade-in">
          <ul id={listId} role="listbox" aria-label={t("header.searchSuggestions")} className="max-h-[70vh] overflow-y-auto p-1.5">
            {items.map((p, i) => (
              <li
                key={p.id}
                id={optionId(i)}
                role="option"
                aria-selected={active === i}
                onPointerEnter={() => setActive(i)}
                onClick={() => go(`/product/${p.slug}`)}
                className={cn("flex cursor-pointer items-center gap-3 rounded-lg p-2", active === i && "bg-surface-3")}
              >
                <ProductImage image={p.image} alt={p.name} className="size-12 shrink-0 rounded-md" sizes="48px" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                  {p.sku && <span className="text-xs text-muted">{t("common.sku")} {p.sku}</span>}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular">{formatPrice(p.price_minor)}</span>
              </li>
            ))}
            {items.length > 0 && (
              <li
                id={optionId(items.length)}
                role="option"
                aria-selected={active === items.length}
                onPointerEnter={() => setActive(items.length)}
                onClick={submit}
                className={cn(
                  "mt-1 flex cursor-pointer items-center justify-between rounded-lg border-t border-line px-3 py-2.5 text-sm font-semibold text-brand-text",
                  active === items.length && "bg-surface-3",
                )}
              >
                {t("header.searchAllResults")} · {total}
                <Icon name="arrowRight" className="size-4" />
              </li>
            )}
          </ul>
          {!items.length && (
            <p className="px-4 py-5 text-sm text-muted" role="status">
              {isFetching || !enabled ? t("common.loading") : t("header.searchNothing")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
