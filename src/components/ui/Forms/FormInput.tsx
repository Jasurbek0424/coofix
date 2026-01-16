"use client";

import { forwardRef } from "react";
import clsx from "clsx";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-0 py-1.5 sm:py-2 text-sm border-0 border-b-2 bg-transparent focus:outline-none transition-colors",
            error
              ? "border-red text-red placeholder-red/50"
              : "border-gray focus:border-orange text-foreground",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
