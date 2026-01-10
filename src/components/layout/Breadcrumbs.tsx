"use client";

import Link from "next/link";
import clsx from "clsx";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={clsx("flex items-center gap-2 text-sm text-smoky mb-4", className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-smoky">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-smoky hover:text-orange transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

