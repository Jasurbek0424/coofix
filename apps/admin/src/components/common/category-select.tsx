import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/i18n/ru";
import { buildTree, categoryPath, descendantIds, flattenTree } from "@/lib/category-tree";
import { cn } from "@/lib/utils";

/** Searchable tree select. `exclude` hides a subtree (for choosing a parent). */
export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = t.categories.selectPlaceholder,
  allowNone,
  noneLabel = t.categories.root,
  exclude,
  id,
  className,
  "aria-invalid": ariaInvalid,
  disabled,
}: {
  categories: Category[] | undefined;
  value: number | null | undefined;
  onChange: (id: number | null) => void;
  placeholder?: string;
  allowNone?: boolean;
  noneLabel?: string;
  exclude?: number;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const flat = useMemo(() => {
    const tree = buildTree(categories ?? []);
    const hidden = exclude !== undefined ? descendantIds(tree, exclude) : new Set<number>();
    return flattenTree(tree).filter((n) => !hidden.has(n.cat.id));
  }, [categories, exclude]);

  const label = value != null ? categoryPath(categories, value) : allowNone ? noneLabel : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn("w-full justify-between px-3 font-normal aria-invalid:border-destructive", !label && "text-muted-foreground", className)}
        >
          <span className="truncate">{label || placeholder}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        <Command
          filter={(itemValue, search) => (itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder={t.categories.searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{t.palette.empty}</CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value={`__none ${noneLabel}`}
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <span className="text-muted-foreground">{noneLabel}</span>
                  {value == null && <CheckIcon className="ml-auto" />}
                </CommandItem>
              )}
              {flat.map((n) => (
                <CommandItem
                  key={n.cat.id}
                  value={`${n.cat.id} ${n.path.join(" / ")} ${n.cat.slug}`}
                  onSelect={() => {
                    onChange(n.cat.id);
                    setOpen(false);
                  }}
                >
                  <span style={{ paddingLeft: n.depth * 14 }} className={cn("truncate", !n.cat.is_active && "text-muted-foreground")}>
                    {n.depth > 0 && <span className="mr-1 text-muted-foreground/60">└</span>}
                    {n.cat.name.ru ?? n.cat.slug}
                  </span>
                  {value === n.cat.id && <CheckIcon className="ml-auto text-primary!" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
