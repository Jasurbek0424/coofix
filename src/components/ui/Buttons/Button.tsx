"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gray" | "dark";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
  className,
  onClick,
}: ButtonProps) {
  const base =
    "px-6 py-3 rounded-md font-noto font-medium transition-all duration-200 text-center";

  const variants = {
    primary: "bg-orange text-white hover:bg-statDark border border-transparent hover:border-black active:bg-black cursor-pointer",
    secondary:
      "bg-white text-statDark border border-gray hover:bg-orange hover:text-white cursor-pointer",
    gray: "bg-gray-smoky/20 text-smoky cursor-not-allowed cursor-pointer border border-gray",
    dark: "bg-statDark dark:text-white hover:bg-orange cursor-pointer border border-coal",
  };

  return (
    <button
      type={type}
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
