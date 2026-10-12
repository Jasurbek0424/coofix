const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const moneyFrac = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Kopecks → "12 990 ₽" (kopecks shown only when non-zero). */
export function formatPrice(minor: number): string {
  const rub = minor / 100;
  const s = Number.isInteger(rub) ? money.format(rub) : moneyFrac.format(rub);
  return `${s} ₽`;
}

export function discountPercent(price: number, old: number | null | undefined): number | null {
  if (!old || old <= price) return null;
  return Math.round(((old - price) / old) * 100);
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

/** Digits of a RU phone → "+7 (926) 737-03-37" (progressive, for input masks). */
export function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d && !d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = d.slice(1);
  if (!d) return "";
  let out = "+7";
  if (p.length > 0) out += " (" + p.slice(0, 3);
  if (p.length >= 3) out += ")";
  if (p.length > 3) out += " " + p.slice(3, 6);
  if (p.length > 6) out += "-" + p.slice(6, 8);
  if (p.length > 8) out += "-" + p.slice(8, 10);
  return out;
}

/** "+7 (926) 737-03-37" → "+79267370337" (what the API expects). */
export function normalizePhone(masked: string): string {
  const d = masked.replace(/\D/g, "");
  return d ? `+${d}` : "";
}
