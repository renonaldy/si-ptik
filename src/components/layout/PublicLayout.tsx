import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { label: "Beranda", to: "/" },
  { label: "Berita", to: "/berita" },
  { label: "Galeri", to: "/galeri" },
  { label: "Visi & Misi", to: "/visi-misi" },
  { label: "Akademik", to: "/akademik" },
  { label: "Kewirausahaan", to: "/kewirausahaan" },
  { label: "Download", to: "/download" },
  { label: "Kontak", to: "/kontak" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-sm font-bold text-primary-foreground">
        P
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-foreground">SI PTIK</div>
        <div className="text-[11px] text-muted-foreground">Program Studi</div>
      </div>
    </Link>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div className="flex min-h-screen flex-col bg-app-aurora">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Brand />
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setOpen((o) => !o)}
            title="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-background lg:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls} onClick={() => setOpen(false)}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
          <div className="md:col-span-2">
            <Brand />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Sistem Informasi Program Studi Pendidikan Teknik Informatika dan Komputer — portal informasi
              akademik, berita, dan layanan program studi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Tautan</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {NAV.slice(1, 5).map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-primary">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Layanan</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/daftar" className="hover:text-primary">Pendaftaran</Link></li>
              <li><Link to="/kewirausahaan" className="hover:text-primary">IT Solution</Link></li>
              <li><Link to="/download" className="hover:text-primary">Download</Link></li>
              <li><Link to="/kontak" className="hover:text-primary">Kontak</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground md:px-6">
            © {`${new Date().getFullYear()}`} Program Studi PTIK. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
