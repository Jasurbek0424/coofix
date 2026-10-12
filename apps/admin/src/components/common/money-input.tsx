import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Rubles as a string (e.g. "1290.50"); conversion to kopecks happens in the form schema. */
export function MoneyInput({ className, onChange, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        autoComplete="off"
        className={cn("pr-7 tabular", className)}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[^\d.,\s]/g, "");
          onChange?.(e);
        }}
        {...props}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">₽</span>
    </div>
  );
}
