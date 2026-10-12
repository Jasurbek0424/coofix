import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { NavLink } from "react-router";
import { Tooltip } from "@/components/ui/tooltip";
import { t } from "@/i18n/ru";
import { useAuth } from "@/lib/auth";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { can } = useAuth();
  return (
    <nav className="flex flex-col gap-4 px-2 py-3">
      {NAV.map((section, i) => {
        const items = section.items.filter((it) => can(it.permission));
        if (!items.length) return null;
        return (
          <div key={i} className="flex flex-col gap-0.5">
            {section.label && !collapsed && (
              <div className="px-2.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">{section.label}</div>
            )}
            {items.map((it) => {
              const link = (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                      isActive && "bg-sidebar-accent text-foreground",
                      collapsed && "justify-center px-0",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-primary" />}
                      <it.icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                    </>
                  )}
                </NavLink>
              );
              return collapsed ? (
                <Tooltip key={it.to} content={it.label} side="right">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className={cn("flex h-13 items-center border-b border-sidebar-border px-3", collapsed && "justify-center px-0")}>
        <Logo collapsed={collapsed} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("border-t border-sidebar-border p-2", collapsed && "flex justify-center")}>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          aria-label={collapsed ? t.nav.expand : t.nav.collapse}
          title={collapsed ? t.nav.expand : t.nav.collapse}
        >
          {collapsed ? <PanelLeftOpenIcon className="mx-auto size-4" /> : <PanelLeftCloseIcon className="size-4" />}
          {!collapsed && t.nav.collapse}
        </button>
      </div>
    </aside>
  );
}
