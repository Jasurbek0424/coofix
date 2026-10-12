import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "block w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-150 hover:border-muted focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:bg-surface-2 disabled:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

interface FieldProps {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  optional?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}

/** Label + control + hint/error with correct aria wiring. */
export function Field({ label, error, hint, optional, children, className }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink-2">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">{optional}</span>}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={errId} className="text-[13px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(inputClass, "h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-24 py-3", className)} {...rest} />;
}

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  label: ReactNode;
  count?: number;
}

export function Checkbox({ label, className, count, ...rest }: CheckboxProps) {
  return (
    <label className={cn("group flex min-h-9 cursor-pointer items-center gap-3 text-[15px] text-ink-2", className)}>
      <span className="relative grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-[6px] border border-line-strong bg-surface transition-colors checked:border-brand checked:bg-brand group-hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          {...rest}
        />
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute size-3.5 text-on-brand opacity-0 peer-checked:opacity-100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted tabular">{count}</span>}
    </label>
  );
}

interface SwitchProps extends Omit<ComponentProps<"input">, "type"> {
  label: ReactNode;
}

export function Switch({ label, className, ...rest }: SwitchProps) {
  return (
    <label className={cn("flex min-h-10 cursor-pointer items-center justify-between gap-3 text-[15px] text-ink-2", className)}>
      <span>{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span className="h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
