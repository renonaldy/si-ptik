import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";

import { useMe } from "@/features/auth/useMe";
import { logout } from "@/features/auth/useAuth";
import { roleLabel } from "@/features/auth/permissions";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { loadTheme, toggleTheme, type Theme } from "@/lib/theme";

export function UserMenu() {
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(loadTheme());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 shadow-sm transition-colors hover:bg-muted"
      >
        <InitialsAvatar name={me?.full_name ?? "?"} className="h-7 w-7" />
        <span className="hidden text-sm font-medium text-foreground sm:inline">{me?.full_name ?? "—"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-soft-lg fade-in">
          <div className="border-b border-border px-4 py-3">
            <div className="truncate text-sm font-semibold text-foreground">{me?.full_name ?? "—"}</div>
            <div className="truncate text-xs text-muted-foreground">{me?.email ?? ""}</div>
            <span className="mt-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {roleLabel(me?.role)}
            </span>
          </div>
          <button
            onClick={() => setThemeState(toggleTheme())}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}
