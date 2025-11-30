"use client";

import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const theme = saved || (prefersDark ? "mydark" : "mylight");
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return <>{children}</>;
}
