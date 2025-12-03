"use client";

import { forwardRef } from "react";
import clsx from "clsx";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-0 py-2 border-2 rounded text-foreground bg-transparent focus:outline-none transition-colors resize-none",
            error
              ? "border-red text-red placeholder-red/50"
              : "border-gray focus:border-orange text-coal",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray">{helperText}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
