"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "./Icon";

type Side = "bottom" | "left" | "right" | "center";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Visually hide the title (still announced). */
  hideTitle?: boolean;
}

const sideClass: Record<Side, string> = {
  bottom:
    "mt-auto mb-0 w-full max-w-none max-h-[88dvh] rounded-t-2xl animate-sheet-up sm:mx-auto sm:max-w-lg",
  left: "mr-auto ml-0 h-dvh max-h-dvh w-[min(88vw,380px)] max-w-none rounded-none animate-slide-in",
  right: "ml-auto mr-0 h-dvh max-h-dvh w-[min(92vw,440px)] max-w-none rounded-none animate-fade-in",
  center: "m-auto w-[min(92vw,480px)] rounded-2xl animate-pop",
};

/**
 * Modal sheet on top of the native <dialog>: top layer, inert background, Escape to close,
 * focus is moved in and restored by the browser. Backdrop click closes.
 */
export function Sheet({ open, onClose, title, side = "center", children, footer, className, hideTitle }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "flex-col overflow-hidden border-0 bg-surface p-0 text-ink shadow-lg backdrop:bg-scrim backdrop:backdrop-blur-[2px] open:flex",
        sideClass[side],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id={titleId} className={cn("text-lg font-semibold", hideTitle && "sr-only")}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 ml-auto grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-ink"
          aria-label={t("common.close")}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
    </dialog>
  );
}
