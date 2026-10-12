import { DropdownMenu as P } from "radix-ui";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = P.Root;
export const DropdownMenuTrigger = P.Trigger;
export const DropdownMenuGroup = P.Group;
export const DropdownMenuRadioGroup = P.RadioGroup;
export const DropdownMenuSub = P.Sub;

const itemClass =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

export function DropdownMenuContent({ className, sideOffset = 4, ...props }: ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      />
    </P.Portal>
  );
}

export function DropdownMenuItem({ className, variant, ...props }: ComponentProps<typeof P.Item> & { variant?: "default" | "destructive" }) {
  return <P.Item data-variant={variant} className={cn(itemClass, className)} {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof P.RadioItem>) {
  return (
    <P.RadioItem className={cn(itemClass, "pr-8", className)} {...props}>
      {children}
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <P.ItemIndicator>
          <CheckIcon className="size-4" />
        </P.ItemIndicator>
      </span>
    </P.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof P.Label>) {
  return <P.Label className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof P.Separator>) {
  return <P.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export function DropdownMenuSubTrigger({ className, ...props }: ComponentProps<typeof P.SubTrigger>) {
  return <P.SubTrigger className={cn(itemClass, "data-[state=open]:bg-accent", className)} {...props} />;
}

export function DropdownMenuSubContent({ className, ...props }: ComponentProps<typeof P.SubContent>) {
  return (
    <P.Portal>
      <P.SubContent className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-lg", className)} {...props} />
    </P.Portal>
  );
}
