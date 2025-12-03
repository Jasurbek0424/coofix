"use client";

import { FaInstagram, FaVk, FaTelegramPlane } from "react-icons/fa";
import clsx from "clsx";

interface SocialIconsProps {
  className?: string;
  iconSize?: number;
  variant?: "header" | "footer";
}

export function SocialIcons({
  className = "",
  iconSize = 16,
  variant = "header",
}: SocialIconsProps) {
  const socialLinks = [
    {
      href: "https://www.instagram.com/coofixrussia",
      icon: FaInstagram,
      label: "Instagram",
    },
    {
      href: "https://vk.com/coofixrussia",
      icon: FaVk,
      label: "VKontakte",
    },
    {
      href: "https://t.me/coofixmoskov",
      icon: FaTelegramPlane,
      label: "Telegram",
    },
  ];

  const containerClasses = clsx("flex items-center gap-3", className);
  const iconClasses = clsx(
    "rounded-full flex items-center justify-center transition-colors",
    variant === "header"
      ? "w-8 h-8 bg-white text-coal hover:bg-orange hover:text-white"
      : "w-10 h-10 bg-gray-dark text-white hover:bg-orange"
  );

  return (
    <div className={containerClasses}>
      {socialLinks.map(({ href, icon: Icon, label }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClasses}
          aria-label={label}
        >
          <Icon size={iconSize} />
        </a>
      ))}
    </div>
  );
}
