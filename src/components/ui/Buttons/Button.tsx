"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gray" | "dark";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  className,
  onClick,
}: ButtonProps) {
  const base =
    "px-6 py-3 rounded-md font-noto font-medium transition-all duration-200 text-center";

  const variants = {
    primary: "bg-orange text-white hover:bg-black active:bg-black cursor-pointer",
    secondary:
      "bg-white text-statDark border border-gray hover:bg-orange hover:text-white cursor-pointer",
    gray: "bg-gray-smoky/20 text-gray-smoky cursor-not-allowed cursor-pointer border border-dark-coal",
    dark: "bg-statDark dark:text-white hover:bg-orange cursor-pointer border border-dark-coal",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        base,
        variants[variant],
        disabled && "opacity-80 pointer-events-none",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
