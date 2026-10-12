/** Content locales the backend accepts. `ru` is required; others are optional translations. */
export const DEFAULT_LOCALE = "ru" as const;
export const ALL_LOCALES = ["ru", "zh"] as const;
export type Locale = (typeof ALL_LOCALES)[number];

/**
 * Feature flag: which translation tabs the editors show.
 * Enable Chinese later with VITE_CONTENT_LOCALES=ru,zh at build time.
 */
export const CONTENT_LOCALES: readonly Locale[] = (() => {
  const raw = (import.meta.env.VITE_CONTENT_LOCALES as string | undefined) ?? "ru";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Locale => (ALL_LOCALES as readonly string[]).includes(s));
  return list.includes(DEFAULT_LOCALE) ? list : [DEFAULT_LOCALE, ...list];
})();

/** Public storefront origin, used for "open on site" links. */
export const STORE_URL = (import.meta.env.VITE_STORE_URL as string | undefined) ?? "https://coofix.store";

/** Storefront product page (path pattern can change with apps/web routing). */
export const storeProductUrl = (slug: string) => `${STORE_URL}/product/${encodeURIComponent(slug)}`;

export const LOW_STOCK = 5;
