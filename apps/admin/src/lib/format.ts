const dateTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const relative = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" });

export const formatDateTime = (iso: string | null | undefined) => (iso ? dateTime.format(new Date(iso)) : "—");
export const formatDate = (iso: string | null | undefined) => (iso ? dateOnly.format(new Date(iso)) : "—");
export const formatDayMonth = (iso: string) => dayMonth.format(new Date(iso));

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return relative.format(Math.round(diff), "second");
  if (abs < 3600) return relative.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return relative.format(Math.round(diff / 86400), "day");
  return formatDate(iso);
}

export const formatNumber = (n: number) => n.toLocaleString("ru-RU").replace(/\u202f|\u00a0/g, " ");

export function formatPhone(p: string | null | undefined): string {
  if (!p) return "—";
  const m = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(p);
  return m ? `+7 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : p;
}

export function fullName(u: { first_name: string; last_name: string | null }) {
  return [u.first_name, u.last_name].filter(Boolean).join(" ");
}
