import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import { useSiteContent } from "@/features/content/useSiteContent";
import { useMe } from "@/features/auth/useMe";
import { useMyMenuAccess } from "@/features/menuAccess/hooks/useMenuAccess";
import { canManage, isSuperAdmin } from "@/features/auth/permissions";
import { MENU, ALWAYS_ALLOWED, type MenuSection } from "@/lib/menu";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onNavItemClick?: () => void;
}

export function AppSidebar({ onNavItemClick }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useSiteContent();
  const { data: me } = useMe();
  const { data: myAccess } = useMyMenuAccess();

  const role = me?.role;
  const manage = canManage(role);

  // Build the visible sections for this account. Admins see everything; dosen/
  // mahasiswa see only the keys granted to their account (dashboard always
  // included), and never the admin-only system menus.
  const sections = useMemo<MenuSection[]>(() => {
    if (manage) return MENU;

    const allowed = new Set<string>([
      ...ALWAYS_ALLOWED,
      ...(myAccess?.menu_keys ?? []),
    ]);

    return MENU.map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly && allowed.has(item.key)),
    })).filter((section) => section.items.length > 0);
  }, [manage, myAccess]);

  const go = (path: string) => {
    navigate(path);
    onNavItemClick?.();
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <BrandLogo className="h-10 w-10" />
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">SI PTIK</div>
          <div className="text-[11px] text-sidebar-foreground/60">Program Studi</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-thin px-3 py-3">
        {sections.map((section) => (
          <div key={section.heading}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={cn(
                      "group flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-white",
                      )}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* View public site */}
      <div className="px-3 pb-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-[18px] w-[18px]" /> Lihat Situs
        </a>
      </div>

      {/* Footer — credit for everyone; System Version for super admin only. */}
      <div className="border-t border-sidebar-border px-6 py-4 text-left text-[11px] leading-relaxed text-sidebar-foreground/45">
        {isSuperAdmin(role) && (
          <div className="font-medium text-sidebar-foreground/70">System Version {get("system_version", "1.0")}</div>
        )}
        <div className={cn(isSuperAdmin(role) && "mt-1")}>Developed &amp; Copyright &copy;</div>
        <div>Renonaldy Pratama D</div>
      </div>
    </aside>
  );
}
