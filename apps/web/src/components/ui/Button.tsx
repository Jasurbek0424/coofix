import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-press shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
  dark: "bg-ink text-bg hover:bg-ink-2",
  outline: "border border-line-strong bg-surface text-ink hover:border-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-3",
  soft: "bg-surface-3 text-ink hover:bg-line",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-md px-3.5 text-sm",
  md: "h-11 rounded-lg px-5 text-[15px]",
  lg: "h-13 rounded-lg px-7 text-base",
  icon: "size-11 rounded-lg",
  "icon-sm": "size-9 rounded-md",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant, size, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
