"use client";

import { useState, forwardRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import clsx from "clsx";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={clsx(
              "w-full px-0 py-2 pr-10 border-0 border-b-2 bg-transparent focus:outline-none transition-colors",
              error
                ? "border-red text-red placeholder-red/50"
                : "border-gray focus:border-orange text-foreground",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-smoky hover:text-orange transition-colors focus:outline-none"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? (
              <FiEyeOff size={20} />
            ) : (
              <FiEye size={20} />
            )}
          </button>
        </div>
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

PasswordInput.displayName = "PasswordInput";

