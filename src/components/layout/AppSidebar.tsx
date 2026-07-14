import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  FlaskConical,
  BookOpen,
  BookMarked,
  FileCheck,
  ClipboardCheck,
  Award,
  HandCoins,
  Laptop,
  Newspaper,
  Image as ImageIcon,
  Download as DownloadIcon,
  Inbox,
  Settings,
  MessagesSquare,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

import { useSiteContent } from "@/features/content/useSiteContent";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

// Grouped nav — each entry maps to a ported domain.
const NAV: NavSection[] = [
  {
    heading: "Utama",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    heading: "Akademik",
    items: [
      { label: "Dosen", icon: GraduationCap, path: "/dosen" },
      { label: "Penelitian", icon: FlaskConical, path: "/penelitian" },
      { label: "Skripsi", icon: BookOpen, path: "/skripsi" },
      { label: "Sempro", icon: FileCheck, path: "/sempro" },
      { label: "Jadwal Ujian", icon: ClipboardCheck, path: "/kelola/ujian" },
      { label: "Wisudawan", icon: Award, path: "/wisudawan" },
      { label: "Administrasi", icon: FileText, path: "/administrasi" },
    ],
  },
  {
    heading: "Alumni",
    items: [
      { label: "Alumni", icon: Users, path: "/alumni" },
      { label: "Skripsi Alumni", icon: BookMarked, path: "/skripsi-alumni" },
      { label: "Sumbangan", icon: HandCoins, path: "/sumbangan" },
    ],
  },
  {
    heading: "Pelatihan",
    items: [{ label: "Pelatihan Microsoft", icon: Laptop, path: "/microsoft" }],
  },
  {
    heading: "Konten Publik",
    items: [
      { label: "Berita", icon: Newspaper, path: "/kelola/berita" },
      { label: "Galeri", icon: ImageIcon, path: "/kelola/galeri" },
      { label: "Download", icon: DownloadIcon, path: "/kelola/download" },
      { label: "Kurikulum", icon: BookMarked, path: "/kelola/kurikulum" },
      { label: "Testimoni & FAQ", icon: MessagesSquare, path: "/kelola/beranda" },
      { label: "Pendaftaran", icon: Inbox, path: "/kelola/pendaftaran" },
      { label: "Pengaturan Situs", icon: Settings, path: "/kelola/pengaturan" },
    ],
  },
];

interface AppSidebarProps {
  onNavItemClick?: () => void;
}

export function AppSidebar({ onNavItemClick }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = useSiteContent();

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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-sm font-bold text-primary-foreground shadow-soft">
          P
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">SI PTIK</div>
          <div className="text-[11px] text-sidebar-foreground/60">Program Studi</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-thin px-3 py-3">
        {NAV.map((section) => (
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

      {/* System version + credit */}
      <div className="border-t border-sidebar-border px-6 py-4 text-left text-[11px] leading-relaxed text-sidebar-foreground/45">
        <div className="font-medium text-sidebar-foreground/70">System Version {get("system_version", "1.0")}</div>
        <div className="mt-1">Developed &amp; Copyright &copy;</div>
        <div>Renonaldy Pratama D</div>
      </div>
    </aside>
  );
}
