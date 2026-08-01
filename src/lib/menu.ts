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
  Megaphone,
  Trophy,
  Download as DownloadIcon,
  Inbox,
  Settings,
  MessagesSquare,
  UserCog,
  ShieldCheck,
  Target,
  ListChecks,
  Grid3x3,
  ClipboardList,
  FileBarChart,
  Crosshair,
  ClipboardCheck as AssessmentIcon,
  TrendingUp,
  Navigation,
  type LucideIcon,
} from "lucide-react";

// Canonical menu keys — the stable identity of every sidebar entry. Used by the
// sidebar, the per-role access config, and the route guards. Keep in sync with
// the routes in App.tsx and the backend seed defaults.
export type MenuKey =
  | "dashboard"
  | "dosen"
  | "penelitian"
  | "skripsi"
  | "sempro"
  | "ujian"
  | "wisudawan"
  | "administrasi"
  | "alumni"
  | "skripsi-alumni"
  | "sumbangan"
  | "microsoft"
  | "berita"
  | "galeri"
  | "promosi"
  | "challenge"
  | "download"
  | "kurikulum"
  | "beranda"
  | "pendaftaran"
  | "pengaturan"
  | "pengguna"
  | "akses"
  | "navigasi"
  | "obe"
  | "obe-kurikulum"
  | "obe-cpl"
  | "obe-ik"
  | "obe-cpmk"
  | "obe-mapping"
  | "obe-assessment"
  | "obe-rps"
  | "obe-nilai"
  | "obe-achievement"
  | "obe-laporan";

export interface MenuItem {
  key: MenuKey;
  label: string;
  icon: LucideIcon;
  path: string;
  /** Only super_admin + admin ever see this. Never configurable for lower roles. */
  adminOnly?: boolean;
  /** Has a per-menu CRUD backend, so CRUD rights can be granted to lower roles.
   *  (Excludes dashboard and the content-backed pages, which stay admin-only.) */
  crud?: boolean;
}

export interface MenuSection {
  heading: string;
  items: MenuItem[];
}

// Single source of truth for the whole sidebar.
export const MENU: MenuSection[] = [
  {
    heading: "Utama",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    heading: "Akademik",
    items: [
      { key: "dosen", label: "Dosen", icon: GraduationCap, path: "/dosen", crud: true },
      { key: "penelitian", label: "Penelitian", icon: FlaskConical, path: "/penelitian", crud: true },
      { key: "skripsi", label: "Skripsi", icon: BookOpen, path: "/skripsi", crud: true },
      { key: "sempro", label: "Sempro", icon: FileCheck, path: "/sempro", crud: true },
      { key: "ujian", label: "Jadwal Ujian", icon: ClipboardCheck, path: "/kelola/ujian", crud: true },
      { key: "wisudawan", label: "Wisudawan", icon: Award, path: "/wisudawan", crud: true },
      { key: "administrasi", label: "Administrasi", icon: FileText, path: "/administrasi", crud: true },
    ],
  },
  {
    heading: "Alumni",
    items: [
      { key: "alumni", label: "Alumni", icon: Users, path: "/alumni", crud: true },
      { key: "skripsi-alumni", label: "Skripsi Alumni", icon: BookMarked, path: "/skripsi-alumni", crud: true },
      { key: "sumbangan", label: "Sumbangan", icon: HandCoins, path: "/sumbangan", crud: true },
    ],
  },
  {
    heading: "Pelatihan",
    items: [{ key: "microsoft", label: "Pelatihan Microsoft", icon: Laptop, path: "/microsoft", crud: true }],
  },
  {
    // Kurikulum OBE module. Writes on all /api/v1/obe/* are gated by the single
    // backend menu key "obe"; the per-page keys below only control frontend
    // visibility (so a dosen can be granted read of e.g. RPS + CPMK only).
    heading: "Kurikulum OBE",
    items: [
      { key: "obe", label: "Dashboard OBE", icon: LayoutDashboard, path: "/kelola/obe" },
      { key: "obe-kurikulum", label: "Kurikulum", icon: BookMarked, path: "/kelola/obe/kurikulum" },
      { key: "obe-cpl", label: "CPL", icon: Target, path: "/kelola/obe/cpl" },
      { key: "obe-ik", label: "Indikator Kinerja", icon: Crosshair, path: "/kelola/obe/ik" },
      { key: "obe-cpmk", label: "CPMK", icon: ListChecks, path: "/kelola/obe/cpmk" },
      { key: "obe-mapping", label: "Mapping", icon: Grid3x3, path: "/kelola/obe/mapping" },
      { key: "obe-assessment", label: "Assessment", icon: AssessmentIcon, path: "/kelola/obe/assessment" },
      { key: "obe-rps", label: "RPS", icon: ClipboardList, path: "/kelola/obe/rps" },
      // crud: true → backend path /obe-nilai punya CRUDGuard key sendiri, jadi
      // dosen bisa diberi hak input nilai tanpa hak tulis modul OBE lainnya.
      { key: "obe-nilai", label: "Kelas & Nilai", icon: Users, path: "/kelola/obe/nilai", crud: true },
      { key: "obe-achievement", label: "Achievement", icon: TrendingUp, path: "/kelola/obe/achievement" },
      { key: "obe-laporan", label: "Laporan", icon: FileBarChart, path: "/kelola/obe/laporan" },
    ],
  },
  {
    heading: "Konten Publik",
    items: [
      { key: "berita", label: "Berita", icon: Newspaper, path: "/kelola/berita", crud: true },
      { key: "galeri", label: "Galeri", icon: ImageIcon, path: "/kelola/galeri", crud: true },
      { key: "promosi", label: "Promosi", icon: Megaphone, path: "/kelola/promosi", crud: true },
      { key: "challenge", label: "Challenge", icon: Trophy, path: "/kelola/challenge", crud: true },
      { key: "download", label: "Download", icon: DownloadIcon, path: "/kelola/download", crud: true },
      { key: "kurikulum", label: "Kurikulum", icon: BookMarked, path: "/kelola/kurikulum" },
      { key: "beranda", label: "Testimoni & FAQ", icon: MessagesSquare, path: "/kelola/beranda" },
      { key: "pendaftaran", label: "Pendaftaran", icon: Inbox, path: "/kelola/pendaftaran", crud: true },
    ],
  },
  {
    heading: "Sistem",
    items: [
      { key: "pengguna", label: "Manajemen Pengguna", icon: UserCog, path: "/kelola/pengguna", adminOnly: true },
      { key: "akses", label: "Hak Akses Menu", icon: ShieldCheck, path: "/kelola/akses", adminOnly: true },
      { key: "navigasi", label: "Menu Navigasi", icon: Navigation, path: "/kelola/navigasi", adminOnly: true },
      { key: "pengaturan", label: "Pengaturan Situs", icon: Settings, path: "/kelola/pengaturan", adminOnly: true },
    ],
  },
];

// Flat list of every menu item.
export const ALL_MENU_ITEMS: MenuItem[] = MENU.flatMap((s) => s.items);

// Items that an admin may grant to dosen/mahasiswa (everything except the
// admin-only system menus, which lower roles never get).
export const CONFIGURABLE_MENUS: MenuItem[] = ALL_MENU_ITEMS.filter((i) => !i.adminOnly);

// Dashboard is always visible to every authenticated user, regardless of config.
export const ALWAYS_ALLOWED: MenuKey[] = ["dashboard"];

// Longest-path-first so "/kelola/ujian" wins over a hypothetical "/kelola".
const ITEMS_BY_PATH_LEN = [...ALL_MENU_ITEMS].sort((a, b) => b.path.length - a.path.length);

// Resolve a pathname to its owning menu key (for route guards / active state).
export function menuKeyForPath(pathname: string): MenuKey | undefined {
  return ITEMS_BY_PATH_LEN.find(
    (i) => pathname === i.path || pathname.startsWith(i.path + "/"),
  )?.key;
}
