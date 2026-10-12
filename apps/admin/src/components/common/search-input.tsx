import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounced } from "@/hooks/use-debounce";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

/** Debounced search box; local state so typing stays snappy while the URL updates lazily. */
export function SearchInput({
  value,
  onChange,
  placeholder = t.common.search,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounced(local, 300);
  const [synced, setSynced] = useState(value);

  // External reset (e.g. "clear filters") → reflect in the box.
  if (value !== synced) {
    setSynced(value);
    if (value !== debounced) setLocal(value);
  }

  useEffect(() => {
    if (debounced !== value) onChange(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label={t.common.reset}
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
