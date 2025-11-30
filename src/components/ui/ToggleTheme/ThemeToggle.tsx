"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 100);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-dark transition-colors hover:border-transparent hover:bg-coal dark:border-gray dark:hover:bg-coal"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-dark transition-colors hover:border-transparent hover:bg-coal dark:border-gray dark:hover:bg-coal"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <HiSun className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
      ) : (
        <HiMoon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
      )}
    </button>
  );
}

