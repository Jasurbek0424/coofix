import { ru } from "./ru";

/** Shape every locale must satisfy (string literals widened to string). */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof ru>;

export const locale = "ru" as const;
const dict: typeof ru = ru;

type Plural = readonly [string, string, string];

type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string | readonly unknown[]
    ? `${P}${K}`
    : `${P}${K}` | Paths<T[K], `${P}${K}.`>;
}[keyof T & string];

type Get<T, Path extends string> = Path extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? Get<T[H], R>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

type AllPaths = Paths<typeof ru>;
export type TKey = { [P in AllPaths]: Get<typeof ru, P> extends string ? P : never }[AllPaths];
export type PluralKey = { [P in AllPaths]: Get<typeof ru, P> extends Plural ? P : never }[AllPaths];

type Vars = Record<string, string | number>;

function lookup(path: string): unknown {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    node = (node as Record<string, unknown> | undefined)?.[part];
  }
  return node;
}

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Translate a string key: t("cart.title"), t("search.resultsFor", { q }). */
export function t(key: TKey, vars?: Vars): string {
  const v = lookup(key);
  return typeof v === "string" ? interpolate(v, vars) : key;
}

/** Russian plural: tp("cart.items", 5) → "5 товаров". `{n}` is filled automatically. */
export function tp(key: PluralKey, n: number, vars?: Vars): string {
  const forms = lookup(key) as Plural;
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  const form = abs > 10 && abs < 20 ? forms[2] : last === 1 ? forms[0] : last >= 2 && last <= 4 ? forms[1] : forms[2];
  return interpolate(form, { n: formatInt(n), ...vars });
}

/** Structured dictionary values (lists of benefits, FAQ, …). */
export function tx<P extends AllPaths>(key: P): Get<typeof ru, P> {
  return lookup(key) as Get<typeof ru, P>;
}

/** Map an API error code to a localized message (falls back to generic). */
export function errorMessage(code: string | undefined): string {
  const codes = dict.errors.codes as Record<string, string>;
  return (code && codes[code]) || dict.errors.generic;
}

const intFmt = new Intl.NumberFormat("ru-RU");
function formatInt(n: number): string {
  return intFmt.format(n);
}
