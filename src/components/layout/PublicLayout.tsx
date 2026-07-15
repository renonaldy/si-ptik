import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Moon, Sun, Send, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { loadTheme, toggleTheme, type Theme } from "@/lib/theme";
import { BrandLogo } from "@/components/shared/BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type NavLeaf = { label: string; to: string; external?: boolean };
type NavEntry =
  | { type: "link"; label: string; to: string }
  | { type: "dropdown"; label: string; base: string; items: NavLeaf[] };

// "Tentang" & "Akademik" are dropdowns; each item is its own page.
const NAV: NavEntry[] = [
  { type: "link", label: "Beranda", to: "/" },
  {
    type: "dropdown",
    label: "Tentang",
    base: "/tentang",
    items: [
      { label: "Sambutan", to: "/tentang/sambutan" },
      { label: "Profil Program Studi", to: "/tentang/profil" },
      { label: "Visi, Misi & Tujuan", to: "/visi-misi" },
      { label: "Logo", to: "/tentang/logo" },
      { label: "Akreditasi", to: "/tentang/akreditasi" },
      { label: "Dosen", to: "/tentang/dosen" },
      { label: "Lokasi Kampus", to: "/tentang/lokasi" },
      { label: "Media Sosial", to: "/tentang/media-sosial" },
    ],
  },
  {
    type: "dropdown",
    label: "Akademik",
    base: "/akademik",
    items: [
      { label: "Informasi Akademik", to: "/akademik" },
      { label: "Kurikulum", to: "/akademik/kurikulum" },
      { label: "Kegiatan Ujian", to: "/akademik/ujian" },
      { label: "Profil Lulusan", to: "/akademik/profil-lulusan" },
      { label: "Prospek Kerja", to: "/akademik/prospek-kerja" },
    ],
  },
  {
    type: "dropdown",
    label: "Pengembangan",
    base: "/pelatihan-microsoft",
    items: [
      { label: "Pelatihan Microsoft", to: "/pelatihan-microsoft" },
      { label: "Kurikulum OBE", to: "/kurikulum-obe" },
      { label: "Kewirausahaan", to: "https://kewirausahaanptik.my.id/", external: true },
      { label: "Hattatik", to: "https://hattatik.com/", external: true },
    ],
  },
  { type: "link", label: "Berita", to: "/berita" },
  { type: "link", label: "Galeri", to: "/galeri" },
  { type: "link", label: "Kontak", to: "/kontak" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <BrandLogo className="h-10 w-10" />
      <div className="leading-tight">
        <div className="text-sm font-bold text-foreground">SI PTIK</div>
        <div className="text-[11px] text-muted-foreground">Program Studi</div>
      </div>
    </Link>
  );
}

function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("light");
  useEffect(() => setThemeState(loadTheme()), []);
  return (
    <button
      onClick={() => setThemeState(toggleTheme())}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      title="Ganti tema"
      aria-label="Ganti tema"
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

// Centered pill navigation (template's signature nav).
function DesktopNav({ onExternal }: { onExternal: (leaf: NavLeaf) => void }) {
  const { pathname } = useLocation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpenKey(null), [pathname]);

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-primary",
    );

  return (
    <nav className="hidden max-h-fit items-center rounded-full border border-border bg-muted/60 p-1 lg:flex">
      {NAV.map((item) =>
        item.type === "link" ? (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => chip(isActive)}
          >
            {item.label}
          </NavLink>
        ) : (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              setOpenKey(item.label);
            }}
            onMouseLeave={() => {
              closeTimer.current = setTimeout(() => setOpenKey(null), 120);
            }}
          >
            <button
              className={cn(
                chip(pathname === item.base || pathname.startsWith(item.base + "/")),
                "inline-flex items-center gap-1",
              )}
            >
              {item.label}
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", openKey === item.label && "rotate-180")}
              />
            </button>
            {openKey === item.label && (
              <div className="absolute left-1/2 z-50 mt-3 max-h-[70vh] w-60 -translate-x-1/2 overflow-auto rounded-2xl border border-border bg-popover p-2 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:ring-white/10">
                {item.items.map((sub) =>
                  sub.external ? (
                    <a
                      key={sub.to}
                      href={sub.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        onExternal(sub);
                      }}
                      className="group/ext flex items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span>{sub.label}</span>
                      <ArrowUpRight
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-muted-foreground/50 opacity-60 transition-all duration-200 ease-out group-hover/ext:-translate-y-0.5 group-hover/ext:translate-x-0.5 group-hover/ext:text-primary group-hover/ext:opacity-100"
                      />
                    </a>
                  ) : (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className="block rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {sub.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        ),
      )}
    </nav>
  );
}

// Loading interstitial that auto-forwards to an external link.
function ExternalRedirectDialog({
  leaf,
  onOpenChange,
}: {
  leaf: NavLeaf | null;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!leaf) return;
    const t = setTimeout(() => {
      window.location.href = leaf.to;
    }, 1600);
    return () => clearTimeout(t);
  }, [leaf]);

  return (
    <Dialog open={!!leaf} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <Loader2 className="absolute h-16 w-16 animate-spin text-primary/70" strokeWidth={1.5} />
            <ExternalLink className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle>Mengalihkan…</DialogTitle>
            <DialogDescription>
              Anda sedang diarahkan ke{" "}
              <span className="font-medium text-foreground">{leaf?.label}</span>. Mohon tunggu
              sebentar.
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingExternal, setPendingExternal] = useState<NavLeaf | null>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Terima kasih! Anda akan menerima info terbaru dari kami.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-aurora">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 py-2 backdrop-blur lg:py-3">
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-4 px-4 md:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Brand />
          </div>

          <DesktopNav onExternal={setPendingExternal} />

          <div className="flex items-center justify-self-end gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/daftar"
              className="hidden h-11 items-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 lg:inline-flex"
            >
              PMB
            </Link>
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-background lg:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3">
              {NAV.map((n) =>
                n.type === "link" ? (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                ) : (
                  <div key={n.label} className="mt-1">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {n.label}
                    </div>
                    {n.items.map((sub) =>
                      sub.external ? (
                        <a
                          key={sub.to}
                          href={sub.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpen(false);
                            setPendingExternal(sub);
                          }}
                          className="group/ext flex items-center justify-between gap-2 rounded-lg px-3 py-2 pl-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <span>{sub.label}</span>
                          <ArrowUpRight
                            aria-hidden
                            className="h-4 w-4 shrink-0 text-muted-foreground/50 opacity-60 transition-all duration-200 ease-out group-hover/ext:-translate-y-0.5 group-hover/ext:translate-x-0.5 group-hover/ext:text-primary group-hover/ext:opacity-100"
                          />
                        </a>
                      ) : (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-lg px-3 py-2 pl-5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ),
                    )}
                  </div>
                ),
              )}
              <Link
                to="/daftar"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white"
              >
                PMB — Pendaftaran
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* ── Footer (dark, template style) ── */}
      <footer className="relative overflow-hidden bg-gray-900 text-gray-400">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-[#3B2EFF]/30 blur-[150px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Brand + socials */}
            <div className="lg:col-span-4">
              <Link to="/" className="flex items-center gap-2.5">
                <BrandLogo className="h-10 w-10" />
                <div className="leading-tight">
                  <div className="text-sm font-bold text-white">SI PTIK</div>
                  <div className="text-[11px] text-gray-500">Program Studi</div>
                </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-400">
                Sistem Informasi Program Studi Pendidikan Teknik Informatika dan Komputer — portal
                informasi akademik, berita, dan layanan program studi.
              </p>
              <div className="mt-6 flex gap-2">
                {["in", "X", "f"].map((s) => (
                  <span
                    key={s}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-xs font-semibold text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-5">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <span className="mb-5 block text-sm font-semibold text-white">Informasi</span>
                  <nav className="flex flex-col space-y-3 text-sm">
                    <Link to="/berita" className="transition hover:text-white">Berita</Link>
                    <Link to="/galeri" className="transition hover:text-white">Galeri</Link>
                    <Link to="/visi-misi" className="transition hover:text-white">Visi & Misi</Link>
                    <Link to="/akademik" className="transition hover:text-white">Akademik</Link>
                  </nav>
                </div>
                <div>
                  <span className="mb-5 block text-sm font-semibold text-white">Layanan</span>
                  <nav className="flex flex-col space-y-3 text-sm">
                    <Link to="/daftar" className="transition hover:text-white">Pendaftaran</Link>
                    <Link to="/kewirausahaan" className="transition hover:text-white">IT Solution</Link>
                    <Link to="/download" className="transition hover:text-white">Download</Link>
                    <Link to="/kontak" className="transition hover:text-white">Kontak</Link>
                  </nav>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <span className="mb-5 block text-sm font-semibold text-white">Tetap Terhubung</span>
              <p className="mb-4 text-sm text-gray-400">
                Berlangganan untuk info & pengumuman terbaru program studi.
              </p>
              <form onSubmit={onSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Masukkan email Anda"
                  className="h-11 w-full rounded-full border border-gray-700 bg-transparent px-4 text-center text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" /> Berlangganan
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-gray-800">
          <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-gray-500 md:px-6">
            © {new Date().getFullYear()} Program Studi PTIK. Seluruh hak cipta dilindungi{" "}
            <a
              href="https://wa.me/6283898262052"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-400 underline-offset-2 transition hover:text-white hover:underline"
            >
              Developer
            </a>
            .
          </div>
        </div>
      </footer>

      <ExternalRedirectDialog
        leaf={pendingExternal}
        onOpenChange={(o) => {
          if (!o) setPendingExternal(null);
        }}
      />
    </div>
  );
}
