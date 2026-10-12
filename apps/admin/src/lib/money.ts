/**
 * Money is integer kopecks on the wire. Conversion goes through strings only,
 * so "19.99" → 1999 exactly (no 19.99 * 100 = 1998.9999… drift).
 */
const MONEY_RE = /^\d{1,10}(?:[.,]\d{0,2})?$/;
export const MAX_MINOR = 10 ** 12;

export function normalizeMoneyInput(raw: string): string {
  return raw.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
}

export function isValidMoney(raw: string): boolean {
  return MONEY_RE.test(normalizeMoneyInput(raw));
}

/** "1 290,5" → 129050. Returns null for invalid input. */
export function rublesToMinor(raw: string): number | null {
  const s = normalizeMoneyInput(raw);
  if (!MONEY_RE.test(s)) return null;
  const [whole = "0", frac = ""] = s.split(".");
  const minor = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return Number.isSafeInteger(minor) && minor <= MAX_MINOR ? minor : null;
}

/** 129050 → "1290.50", 129000 → "1290" (for input fields). */
export function minorToInput(minor: number | null | undefined): string {
  if (minor == null) return "";
  const whole = Math.trunc(minor / 100);
  const frac = Math.abs(minor % 100);
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
}

const rub0 = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const rub2 = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1299000 → "12 990 ₽"; 1299050 → "12 990,50 ₽". */
export function formatMoney(minor: number | null | undefined): string {
  if (minor == null) return "—";
  const whole = Math.trunc(minor / 100);
  const frac = minor % 100;
  const s = frac === 0 ? rub0.format(whole) : rub2.format(minor / 100);
  return `${s.replace(/\u202f|\u00a0/g, " ")} ₽`;
}

/** Compact axis label: 1 250 000 ₽ → "1,3 млн". */
export function formatMoneyCompact(minor: number): string {
  const rub = minor / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн`;
  if (rub >= 1_000) return `${(rub / 1_000).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} тыс`;
  return rub0.format(rub);
}
