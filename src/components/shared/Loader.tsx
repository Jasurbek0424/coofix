"use client";

import clsx from "clsx";
import { FaCirclePlus } from "react-icons/fa6";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export function Loader({
  size = "lg",
  fullScreen = false,
  className,
}: LoaderProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <FaCirclePlus
            className={clsx(
              "text-orange animate-spin",
              sizeClasses[size],
              className
            )}
          />
          <p className="text-gray-smoky text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center animate-pulse">
      <FaCirclePlus
        className={clsx(
          "text-orange animate-spin",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}