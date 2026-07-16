import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ExternalLink } from "lucide-react";

import { useSiteContent } from "@/features/content/useSiteContent";
import { useMe } from "@/features/auth/useMe";
import { useMyMenuAccess } from "@/features/menuAccess/hooks/useMenuAccess";
import { canManage, isSuperAdmin } from "@/features/auth/permissions";
import { MENU, ALWAYS_ALLOWED, menuKeyForPath, type MenuSection } from "@/lib/menu";
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

  // Resolve exactly one active item by longest-path match, so nested OBE routes
  // (e.g. /kelola/obe/cpl) highlight their own item, not the parent /kelola/obe.
  const activeKey = menuKeyForPath(location.pathname);

  // Sections are collapsed by default; only the one owning the current route
  // starts open so the active item is never hidden.
  const activeHeading = sections.find((s) => s.items.some((i) => i.key === activeKey))?.heading;

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    activeHeading ? { [activeHeading]: true } : {},
  );

  // Re-open the owning section when the route changes (e.g. redirect or link
  // from a page) without collapsing anything the user opened manually.
  useEffect(() => {
    if (!activeHeading) return;
    setExpanded((prev) => (prev[activeHeading] ? prev : { ...prev, [activeHeading]: true }));
  }, [activeHeading]);

  const toggleSection = (heading: string) =>
    setExpanded((prev) => ({ ...prev, [heading]: !prev[heading] }));

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <BrandLogo className="h-10 w-10" />
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">SI PTIK</div>
          <div className="text-[11px] text-sidebar-foreground/60">Pendidikan Teknik Informatika dan Komputer</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {sections.map((section) => {
          const open = !!expanded[section.heading];
          return (
            <div key={section.heading}>
              <button
                onClick={() => toggleSection(section.heading)}
                aria-expanded={open}
                className="flex h-8 w-full items-center justify-between rounded-lg px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 transition-colors hover:bg-white/5 hover:text-sidebar-foreground/70"
              >
                {section.heading}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
                />
              </button>
              {open && (
                <div className="space-y-0.5 pb-2">
                  {section.items.map((item) => {
                    const active = item.key === activeKey;
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
              )}
            </div>
          );
        })}
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
