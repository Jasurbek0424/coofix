"use client";

import clsx from "clsx";
import { FaCirclePlus } from "react-icons/fa6";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
  fullScreen?: boolean;
  className?: string;
}

export function Loader({
  size = "lg",
  variant = "spinner",
  fullScreen = false,
  className,
}: LoaderProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const dotSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const renderSpinner = () => (
    <FaCirclePlus
      className={clsx(
        "text-orange animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );

  const renderDots = () => (
    <div className={clsx("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            "bg-orange rounded-full animate-pulse",
            dotSizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {variant === "dots" ? renderDots() : renderSpinner()}
          <p className="text-gray-smoky text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {variant === "dots" ? renderDots() : renderSpinner()}
    </div>
  );
}