import { Dialog as P } from "radix-ui";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { t } from "@/i18n/ru";
import { cn } from "@/lib/utils";

export const Sheet = P.Root;
export const SheetTrigger = P.Trigger;
export const SheetClose = P.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  hideClose = false,
  ...props
}: ComponentProps<typeof P.Content> & { side?: "left" | "right"; hideClose?: boolean }) {
  return (
    <P.Portal>
      <P.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <P.Content
        className={cn(
          "fixed inset-y-0 z-50 flex h-full flex-col bg-popover shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right"
            ? "right-0 w-full border-l sm:max-w-xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
            : "left-0 w-72 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <P.Close className="absolute top-4 right-4 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none">
            <XIcon className="size-4" />
            <span className="sr-only">{t.common.close}</span>
          </P.Close>
        )}
      </P.Content>
    </P.Portal>
  );
}
export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 border-b px-5 py-4 pr-12", className)} {...props} />;
}
export function SheetTitle({ className, ...props }: ComponentProps<typeof P.Title>) {
  return <P.Title className={cn("text-base font-semibold", className)} {...props} />;
}
export function SheetDescription({ className, ...props }: ComponentProps<typeof P.Description>) {
  return <P.Description className={cn("text-[13px] text-muted-foreground", className)} {...props} />;
}
