"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";

export type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["system", "light", "dark"];
const ICON = { system: "monitor", light: "sun", dark: "moon" } as const;
const LABEL = { system: "common.themeSystem", light: "common.themeLight", dark: "common.themeDark" } as const;

/** Theme lives in a cookie so the server renders the right `data-theme` (no inline script). */
export function ThemeToggle({ initial, className }: { initial: Theme; className?: string }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        const root = document.documentElement;
        if (next === "system") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", next);
        document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn("inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:text-white", className)}
      aria-label={`${t("common.themeToggle")}: ${t(LABEL[theme])}`}
      title={t(LABEL[theme])}
    >
      <Icon name={ICON[theme]} className="size-4" />
      <span className="sr-only sm:not-sr-only">{t(LABEL[theme])}</span>
    </button>
  );
}
