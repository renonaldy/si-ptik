import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  GraduationCap,
  FlaskConical,
  Award,
  BookOpen,
  Newspaper,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { listBeritaPublic, listGaleriPublic } from "@/lib/api/publicApi";
import { useSiteContent } from "@/features/content/useSiteContent";

const WHY = [
  { icon: GraduationCap, title: "Dosen Berkualitas", desc: "Tenaga pengajar bersertifikasi & berpengalaman di bidangnya." },
  { icon: BookOpen, title: "Kurikulum Relevan", desc: "Materi selaras dengan kebutuhan industri teknologi terkini." },
  { icon: FlaskConical, title: "Riset Aktif", desc: "Budaya penelitian yang inovatif dan aplikatif." },
  { icon: Award, title: "Lulusan Kompeten", desc: "Alumni tersebar di berbagai sektor industri teknologi." },
];

export default function HomePage() {
  const { data: berita = [] } = useQuery({ queryKey: ["public", "berita"], queryFn: listBeritaPublic });
  const { data: galeri = [] } = useQuery({ queryKey: ["public", "galeri"], queryFn: listGaleriPublic });
  const { get } = useSiteContent();

  const stats = [
    { value: get("home_stat1_value", "B"), label: get("home_stat1_label", "Akreditasi") },
    { value: get("home_stat2_value", "500+"), label: get("home_stat2_label", "Alumni") },
    { value: get("home_stat3_value", "25+"), label: get("home_stat3_label", "Dosen") },
    { value: get("home_stat4_value", "2010"), label: get("home_stat4_label", "Berdiri") },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-24 md:px-6 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> {get("home_badge", "Program Studi Terakreditasi")}
            </span>
            <h1 className="mx-auto mt-6 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl">
              {get("home_hero_title", "Pendidikan Teknik Informatika & Komputer")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/80 md:text-lg">
              {get("home_hero_subtitle", "Mencetak pendidik dan profesional teknologi yang kompeten, adaptif, dan berdaya saing global.")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/akademik">Info Akademik <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" asChild>
                <Link to="/berita">Lihat Berita</Link>
              </Button>
            </div>
          </div>

          {/* Glass stats strip */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 text-center backdrop-blur-md">
                <div className="font-display text-3xl font-medium tabular-nums">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PTIK */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground">Kenapa PTIK?</h2>
          <p className="mt-2 text-muted-foreground">Lingkungan belajar teknologi yang unggul dan mendukung.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((h) => (
            <div key={h.title} className="card-hairline shadow-glow-hover rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <h.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{h.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Berita terbaru */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground">Berita Terbaru</h2>
              <p className="mt-2 text-muted-foreground">Kabar terkini dari program studi.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/berita">Lihat semua <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          {berita.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center text-sm text-muted-foreground">
              Belum ada berita.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {berita.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  to={`/berita/${b.id}`}
                  className="card-hairline shadow-glow-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5"
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {b.gambar ? (
                      <img src={b.gambar} alt={b.judul} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary">
                        <Newspaper className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> {b.tanggal || "—"}
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">{b.judul}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{b.ringkasan}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Galeri preview */}
      {galeri.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground">Galeri</h2>
              <p className="mt-2 text-muted-foreground">Dokumentasi kegiatan & fasilitas.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/galeri">Lihat semua <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {galeri.slice(0, 4).map((g) => (
              <div key={g.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted shadow-soft">
                {g.gambar && <img src={g.gambar} alt={g.judul} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-sm font-medium text-white">{g.judul}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="bg-hero-aurora card-hairline relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-soft-lg md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-aurora" />
          <h2 className="relative font-display text-2xl font-medium tracking-[-0.01em] md:text-3xl">
            Ada pertanyaan tentang program studi?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/80 md:text-base">
            Tim kami siap membantu memberikan informasi yang Anda butuhkan.
          </p>
          <Button size="lg" variant="secondary" className="relative mt-7" asChild>
            <Link to="/kontak">Hubungi Kami <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
