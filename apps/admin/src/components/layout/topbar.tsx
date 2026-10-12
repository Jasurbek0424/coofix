import { LogOutIcon, MenuIcon, MonitorIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { fullName } from "@/lib/format";
import { type Theme, useTheme } from "@/lib/theme";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolved, toggle } = useTheme();
  const initials = user ? (user.first_name[0] ?? "") + (user.last_name?.[0] ?? "") : "";

  return (
    <header className="sticky top-0 z-30 flex h-13 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-5">
      <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onMenu} aria-label={t.common.openMenu}>
        <MenuIcon />
      </Button>
      <button
        type="button"
        onClick={onSearch}
        className="flex h-8 w-full max-w-72 items-center gap-2 rounded-md border bg-card px-2.5 text-[13px] text-muted-foreground shadow-xs transition-colors hover:bg-accent"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 truncate text-left">{t.palette.hint}</span>
        <Kbd className="hidden sm:inline-flex">{isMac ? "⌘" : "Ctrl"} K</Kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={t.palette.toggleTheme}>
          {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md py-1 pr-1 pl-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40 sm:pr-2"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary uppercase">{initials}</span>
              <span className="hidden max-w-40 truncate text-[13px] font-medium sm:inline">{user && fullName(user)}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="truncate text-sm font-medium text-foreground">{user && fullName(user)}</div>
              <div className="truncate text-xs">{user?.email}</div>
              <div className="mt-1 text-xs text-primary">{user && t.roles[user.role]}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t.theme.label}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <DropdownMenuRadioItem value="light">
                <SunIcon />
                {t.theme.light}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <MoonIcon />
                {t.theme.dark}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <MonitorIcon />
                {t.theme.system}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void logout()}>
              <LogOutIcon />
              {t.auth.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
