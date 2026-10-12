import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

export interface KVRow {
  id: string;
  key: string;
  value: string;
}

let seq = 0;
export const newRow = (key = "", value = ""): KVRow => ({ id: `kv${++seq}`, key, value });
export const toRows = (obj: Record<string, string> | undefined): KVRow[] =>
  Object.entries(obj ?? {}).map(([k, v]) => newRow(k, String(v)));
export const fromRows = (rows: KVRow[]): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const r of rows) {
    const k = r.key.trim();
    if (k) out[k] = r.value.trim();
  }
  return out;
};

/** Ordered key → value editor (product attributes). Duplicates are flagged inline. */
export function KeyValueEditor({
  value,
  onChange,
  max = 100,
}: {
  value: KVRow[];
  onChange: (rows: KVRow[]) => void;
  max?: number;
}) {
  const lastKeyRef = useRef<HTMLInputElement>(null);
  const counts = new Map<string, number>();
  for (const r of value) {
    const k = r.key.trim().toLowerCase();
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const update = (id: string, patch: Partial<KVRow>) => onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const add = () => {
    onChange([...value, newRow()]);
    requestAnimationFrame(() => lastKeyRef.current?.focus());
  };

  return (
    <div className="grid gap-2">
      {value.length === 0 && <p className="rounded-md border border-dashed px-3 py-4 text-center text-[13px] text-muted-foreground">{t.attributes.empty}</p>}
      {value.length > 0 && (
        <div className="hidden grid-cols-[20px_1fr_1.4fr_32px] gap-2 px-0.5 text-xs text-muted-foreground sm:grid">
          <span />
          <span>{t.attributes.key}</span>
          <span>{t.attributes.value}</span>
          <span />
        </div>
      )}
      {value.map((row, i) => {
        const dup = (counts.get(row.key.trim().toLowerCase()) ?? 0) > 1;
        return (
          <div key={row.id} className="grid grid-cols-[20px_1fr_32px] items-start gap-2 sm:grid-cols-[20px_1fr_1.4fr_32px]">
            <div className="flex h-9 flex-col items-center justify-center text-muted-foreground">
              <button type="button" className="h-3 leading-none hover:text-foreground disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t.common.moveUp}>
                ▴
              </button>
              <button type="button" className="h-3 leading-none hover:text-foreground disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={t.common.moveDown}>
                ▾
              </button>
            </div>
            <div>
              <Input
                ref={i === value.length - 1 ? lastKeyRef : undefined}
                value={row.key}
                maxLength={100}
                placeholder={t.attributes.keyPlaceholder}
                aria-label={t.attributes.key}
                aria-invalid={dup || undefined}
                onChange={(e) => update(row.id, { key: e.target.value })}
              />
              {dup && <p className="mt-1 text-xs text-destructive">{t.attributes.duplicate}</p>}
            </div>
            <Input
              className={cn("col-start-2 sm:col-start-auto")}
              value={row.value}
              maxLength={500}
              placeholder={t.attributes.valuePlaceholder}
              aria-label={t.attributes.value}
              onChange={(e) => update(row.id, { value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && i === value.length - 1) {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="row-start-1 col-start-3 mt-0.5 text-muted-foreground hover:text-destructive sm:col-start-4"
              onClick={() => onChange(value.filter((r) => r.id !== row.id))}
              aria-label={t.common.delete}
            >
              <Trash2Icon />
            </Button>
          </div>
        );
      })}
      <div>
        <Button variant="outline" size="sm" onClick={add} disabled={value.length >= max}>
          <PlusIcon />
          {t.attributes.add}
        </Button>
      </div>
    </div>
  );
}

export function hasDuplicateKeys(rows: KVRow[]): boolean {
  const seen = new Set<string>();
  for (const r of rows) {
    const k = r.key.trim().toLowerCase();
    if (!k) continue;
    if (seen.has(k)) return true;
    seen.add(k);
  }
  return false;
}
