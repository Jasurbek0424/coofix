import { LogOutIcon, MoonIcon, PlusIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useNavigate } from "react-router";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { DialogOverlay } from "@/components/ui/dialog";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav";
import { useTheme } from "@/lib/theme";

function isTyping(el: EventTarget | null) {
  const n = el as HTMLElement | null;
  return !!n && (n.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName));
}

/** Cmd/Ctrl+K palette + "g then <key>" navigation shortcuts. */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { can, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const items = NAV_ITEMS.filter((i) => can(i.permission));
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (open || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (gPressed) {
        const target = items.find((i) => i.key === e.key.toLowerCase());
        setGPressed(false);
        if (target) {
          e.preventDefault();
          void navigate(target.to);
        }
      } else if (e.key === "g") {
        setGPressed(true);
        timer = setTimeout(() => setGPressed(false), 1000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [open, onOpenChange, gPressed, items, navigate]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed top-[15%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">{t.palette.hint}</DialogPrimitive.Title>
          <Command loop>
            <CommandInput placeholder={t.palette.placeholder} autoFocus />
            <CommandList>
              <CommandEmpty>{t.palette.empty}</CommandEmpty>
              <CommandGroup heading={t.palette.navigation}>
                {items.map((it) => (
                  <CommandItem key={it.to} value={it.label} onSelect={() => run(() => void navigate(it.to))}>
                    <it.icon />
                    {it.label}
                    <CommandShortcut>G {it.key.toUpperCase()}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading={t.palette.actions}>
                {can("catalog.write") && (
                  <CommandItem value={t.palette.newProduct} onSelect={() => run(() => void navigate("/products/new"))}>
                    <PlusIcon />
                    {t.palette.newProduct}
                  </CommandItem>
                )}
                <CommandItem value={t.palette.toggleTheme} onSelect={() => run(toggle)}>
                  {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
                  {t.palette.toggleTheme}
                </CommandItem>
                <CommandItem value={t.palette.logout} onSelect={() => run(() => void logout())}>
                  <LogOutIcon />
                  {t.palette.logout}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
