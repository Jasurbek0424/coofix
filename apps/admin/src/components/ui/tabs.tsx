import { Tabs as P } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Tabs = P.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof P.List>) {
  return <P.List className={cn("inline-flex h-8 items-center gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: ComponentProps<typeof P.Trigger>) {
  return (
    <P.Trigger
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        className,
      )}
      {...props}
    />
  );
}
export function TabsContent({ className, ...props }: ComponentProps<typeof P.Content>) {
  return <P.Content className={cn("outline-none", className)} {...props} />;
}
