"use client";

import clsx from "clsx";
import { IconType } from "react-icons";

interface Props {
  icon: IconType;
  activeIcon?: IconType;
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
  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-3 rounded-md transition-all duration-200 flex items-center justify-center",

        variant === "cart" &&
          (active
            ? "bg-orange text-white border-2 rounded-tl-md rounded-tr-none rounded-bl-none rounded-br-md"
            : "bg-white text-orange hover:bg-gray-100 border-2 rounded-tl-md rounded-tr-none rounded-bl-none rounded-br-md"),

        variant === "like" &&
          "bg-transparent text-red-500",

        variant === "chart" &&
          " text-gray-700 hover:bg-gray-200 rounded-tl-md rounded-tr-none rounded-bl-none rounded-br-md"
      )}
    >
      {variant === "like" && active && ActiveIcon ? (
        <ActiveIcon size={24} />
      ) : active && ActiveIcon ? (
        <ActiveIcon size={24} />
      ) : (
        <Icon size={24} />
      )}
    </button>
  );
}
