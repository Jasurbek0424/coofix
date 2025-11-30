/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

interface Props {
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  active?: boolean;
  variant: "cart" | "like" | "chart";
  onClick?: () => void;
}

export function IconButton({
  icon: Icon,
  activeIcon: ActiveIcon,
  active = false,
  variant,
  onClick,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-3 transition-all duration-200 flex items-center justify-center cursor-pointer text-orange",

        variant === "cart" &&
          (active
            ? "bg-orange text-white border-2 border-orange rounded-bl-md rounded-tr-md"
            : "bg-white dark:bg-dark text-orange hover:bg-orange hover:text-white border-2 hover:border-orange rounded-bl-md rounded-tr-md"),

        variant === "like" && "bg-transparent ",

        variant === "chart" &&
          (active
            ? "rounded-bl-md rounded-tr-md bg-background dark:text-orange"
            : "dark:text-foreground hover:bg-gray-200 dark:hover:bg-dark")
      )}
    >
      {active && ActiveIcon ? <ActiveIcon size={22} /> : <Icon size={22} />}
    </button>
  );
}
