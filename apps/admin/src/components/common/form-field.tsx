import { useId, type ReactElement, type ReactNode, cloneElement, isValidElement } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label + control + hint/error. Wires id / aria-invalid / aria-describedby onto the child control. */
export function FormField({
  label,
  error,
  hint,
  required,
  className,
  children,
  labelAction,
}: {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
  labelAction?: ReactNode;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: (children.props as { id?: string }).id ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error || hint ? msgId : undefined,
      })
    : children;
  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-primary">*</span>}
          </Label>
          {labelAction}
        </div>
      )}
      {control}
      {error ? (
        <p id={msgId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
