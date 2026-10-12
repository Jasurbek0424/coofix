import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

/**
 * List filters live in the URL so they survive reloads and can be shared.
 * Setting any filter other than `page` resets pagination.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out = {} as Record<K | "page", string | undefined>;
    for (const k of [...keys, "page" as const]) out[k] = params.get(k) ?? undefined;
    return out;
  }, [params, keys]);

  const set = useCallback(
    (patch: Partial<Record<K | "page", string | undefined | null>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch) as [string, string | undefined | null][]) {
            if (v === undefined || v === null || v === "") next.delete(k);
            else next.set(k, v);
          }
          if (!("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  const page = Math.max(1, Number(values.page) || 1);
  const active = keys.some((k) => values[k] !== undefined);
  return { values, set, reset, page, active };
}
