"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi2"; 

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-dark/50 bg-white/10"
        aria-label="Toggle theme"
      />
    );
  }
  
  const currentTheme = theme === 'system' ? 'light' : theme; 

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="flex h-6 w-6 sm:h-8 sm:w-8 md:h-8 md:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full md:border border-solid border-white/50 text-white transition-colors duration-200 
                 hover:border-orange hover:text-orange shrink-0"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <HiSun className="h-5 w-5" /> 
      ) : (
        <HiMoon className="h-5 w-5" />
      )}
    </button>
  );
}