"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import type { CategoryNode } from "@/lib/api/types";
import { PHONES } from "@/lib/site";
import { cn } from "@/lib/cn";
import { t } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { Sheet } from "@/components/ui/Sheet";
import { useAuth } from "@/stores/auth";
import { HeaderActions } from "./HeaderActions";
import { SearchBox } from "./SearchBox";

const NAV_LINKS = [
  { href: "/delivery", key: "nav.delivery" },
  { href: "/wholesale", key: "nav.wholesale" },
  { href: "/about", key: "nav.about" },
  { href: "/contacts", key: "nav.contacts" },
] as const;

export function Header({ categories }: { categories: CategoryNode[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const panelId = useId();

  // Close overlays on navigation (state adjusted during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40">
        <div className="border-b border-line bg-surface/90 backdrop-blur-xl backdrop-saturate-150">
          <div className="container-page flex h-16 items-center gap-2 sm:gap-4 lg:h-[76px] lg:gap-6">
            <button
              type="button"
              className="-ml-2 grid size-11 place-items-center rounded-lg text-ink-2 hover:bg-surface-3 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("header.menu")}
              aria-haspopup="dialog"
            >
              <Icon name="menu" className="size-6" />
            </button>
            <Link href="/" aria-label={t("meta.siteName")} className="shrink-0 rounded-lg">
              <Logo />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls={panelId}
              className={cn(
                "hidden h-11 shrink-0 items-center gap-2.5 rounded-lg px-4 text-[15px] font-semibold transition-colors lg:inline-flex",
                menuOpen ? "bg-ink text-bg" : "bg-brand text-on-brand hover:bg-brand-hover",
              )}
            >
              <span className="relative size-5" aria-hidden="true">
                <span className={cn("absolute left-0.5 right-0.5 top-[5px] h-0.5 rounded bg-current transition-transform duration-200", menuOpen && "translate-y-[4px] rotate-45")} />
                <span className={cn("absolute left-0.5 right-0.5 top-[9px] h-0.5 rounded bg-current transition-opacity", menuOpen && "opacity-0")} />
                <span className={cn("absolute left-0.5 right-0.5 top-[13px] h-0.5 rounded bg-current transition-transform duration-200", menuOpen && "-translate-y-[4px] -rotate-45")} />
              </span>
              {t("header.catalogButton")}
            </button>
            <Suspense fallback={<div className="hidden h-11 flex-1 rounded-lg bg-surface-3 lg:block" />}>
              <SearchBox className="hidden flex-1 lg:block" />
            </Suspense>
            <div className="ml-auto lg:ml-0">
              <HeaderActions />
            </div>
          </div>
          <div className="container-page pb-3 lg:hidden">
            <Suspense fallback={<div className="h-11 rounded-lg bg-surface-3" />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>
        <MegaMenu id={panelId} open={menuOpen} categories={categories} onClose={() => setMenuOpen(false)} />
      </header>
      {menuOpen && <div className="fixed inset-0 z-30 hidden bg-scrim animate-fade-in lg:block" aria-hidden="true" />}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories} />
    </>
  );
}

function MegaMenu({ id, open, categories, onClose }: { id: string; open: boolean; categories: CategoryNode[]; onClose: () => void }) {
  const [activeId, setActiveId] = useState<number | null>(categories[0]?.id ?? null);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div
      id={id}
      hidden={!open}
      className="absolute inset-x-0 top-full hidden border-b border-line bg-surface shadow-lg lg:block"
    >
      {open && (
        <div className="container-page grid max-h-[min(70vh,640px)] grid-cols-[300px_1fr] animate-fade-in">
          <nav aria-label={t("header.allCategories")} className="overflow-y-auto border-r border-line py-4 pr-4">
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalog/${c.slug}`}
                    onPointerEnter={() => setActiveId(c.id)}
                    onFocus={() => setActiveId(c.id)}
                    aria-current={active?.id === c.id ? "true" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                      active?.id === c.id ? "bg-surface-3 text-ink" : "text-ink-2 hover:bg-surface-2",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("h-5 w-1 rounded-full transition-colors", active?.id === c.id ? "bg-brand" : "bg-transparent")} aria-hidden="true" />
                      {c.name}
                    </span>
                    {c.children.length > 0 && <Icon name="chevronRight" className="size-4 text-muted" />}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/catalog" className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-text hover:bg-brand-soft">
              {t("header.allCategories")}
              <Icon name="arrowRight" className="size-4" />
            </Link>
          </nav>
          {active && (
            <div className="overflow-y-auto p-8">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl font-bold tracking-tight">{active.name}</h2>
                <Link href={`/catalog/${active.slug}`} className="group inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-brand-text">
                  {t("header.allInCategory")}
                  <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              {active.children.length > 0 ? (
                <ul className="grid grid-cols-2 gap-x-8 gap-y-6 xl:grid-cols-3">
                  {active.children.map((ch) => (
                    <li key={ch.id}>
                      <Link href={`/catalog/${ch.slug}`} className="font-semibold text-ink hover:text-brand-text">
                        {ch.name}
                      </Link>
                      {ch.children.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {ch.children.slice(0, 6).map((g) => (
                            <li key={g.id}>
                              <Link href={`/catalog/${g.slug}`} className="text-sm text-muted hover:text-ink">
                                {g.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <Link href={`/catalog/${active.slug}`} onClick={onClose} className="text-sm text-muted hover:text-ink">
                  {t("header.allInCategory")}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MobileDrawer({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: CategoryNode[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const user = useAuth((s) => s.user);
  return (
    <Sheet open={open} onClose={onClose} side="left" title={<Logo compact />}>
      <nav aria-label={t("header.mainNav")} className="px-3 py-4">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("common.catalog")}</p>
        <ul className="space-y-0.5">
          {categories.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <li key={c.id}>
                <div className="flex items-center">
                  <Link href={`/catalog/${c.slug}`} className="flex-1 rounded-lg px-2 py-2.5 text-[15px] font-medium hover:bg-surface-3">
                    {c.name}
                  </Link>
                  {c.children.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : c.id)}
                      aria-expanded={isOpen}
                      aria-label={c.name}
                      className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-3"
                    >
                      <Icon name="chevronDown" className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ul className="mb-2 ml-2 border-l border-line pl-3">
                    {c.children.map((ch) => (
                      <li key={ch.id}>
                        <Link href={`/catalog/${ch.slug}`} className="block rounded-md px-2 py-2 text-[15px] text-ink-2 hover:bg-surface-3">
                          {ch.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <div className="my-4 h-px bg-line" />
        <ul className="space-y-0.5">
          <li>
            <Link href={user ? "/account" : "/login"} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-medium hover:bg-surface-3">
              <Icon name="user" className="size-5 text-muted" />
              {user ? t("nav.account") : t("header.login")}
            </Link>
          </li>
          <li>
            <Link href="/compare" className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-medium hover:bg-surface-3">
              <Icon name="compare" className="size-5 text-muted" />
              {t("nav.compare")}
            </Link>
          </li>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block rounded-lg px-2 py-2.5 text-[15px] text-ink-2 hover:bg-surface-3">
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 rounded-xl bg-surface-2 p-4">
          {PHONES.map((p) => (
            <a key={p.href} href={p.href} className="flex items-center gap-2 text-[15px] font-semibold">
              <Icon name="phone" className="size-4 text-brand-text" />
              {p.display}
            </a>
          ))}
          <p className="text-[13px] text-muted">{t("header.workingHours")}</p>
        </div>
      </nav>
    </Sheet>
  );
}
