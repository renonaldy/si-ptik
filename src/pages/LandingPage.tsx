import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen, Users, FlaskConical, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/BrandLogo";

const HIGHLIGHTS = [
  { icon: GraduationCap, title: "Dosen Berkualitas", desc: "Tenaga pengajar bersertifikasi dan berpengalaman." },
  { icon: FlaskConical, title: "Riset & Penelitian", desc: "Budaya penelitian yang aktif dan aplikatif." },
  { icon: BookOpen, title: "Kurikulum Relevan", desc: "Materi selaras dengan kebutuhan industri teknologi." },
  { icon: Award, title: "Lulusan Kompeten", desc: "Alumni tersebar di berbagai sektor teknologi." },
];

function PublicNav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2.5">
        <BrandLogo className="h-10 w-10" />
        <span className="text-base font-bold text-foreground">SI PTIK</span>
      </div>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/akademik">Akademik</Link>
        </Button>
        <Button asChild>
          <Link to="/admin/ptik/login">Masuk</Link>
        </Button>
      </nav>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Program Studi PTIK
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sistem Informasi<br />Pendidikan Teknik Informatika & Komputer
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Portal terpadu untuk data dosen, alumni, skripsi, penelitian, wisudawan, dan
            kegiatan akademik program studi.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/admin/ptik/login">
                Masuk ke Sistem <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/akademik">Info Akademik</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <h.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{h.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {`${new Date().getFullYear()}`} Program Studi PTIK</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Sistem Informasi Program Studi</span>
        </div>
      </footer>
    </div>
  );
}
