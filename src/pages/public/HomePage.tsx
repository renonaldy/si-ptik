import type { CSSProperties } from "react";
import { useState } from "react";
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
  Image as ImageIcon,
  UserPlus,
  Play,
  Plus,
  Users,
  Cpu,
  Rocket,
  Phone,
  Quote,
  Mail,
  MapPin,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listBeritaPublic, listGaleriPublic } from "@/lib/api/publicApi";
import { useSiteContent } from "@/features/content/useSiteContent";
import { parseTestimonials, parseFaqs, type Testimonial } from "@/lib/homeContent";

/* ─────────────────────────── Intro video ─────────────────────────── */

// Normalize a YouTube share/watch URL into an autoplay embed URL (else null).
function toYouTubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

// Button + modal that plays the program-profile video (template's "Watch Intro Video").
function VideoDialog({ url }: { url: string }) {
  const yt = url ? toYouTubeEmbed(url) : null;
  const isFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="gap-3 rounded-full border border-border bg-background pl-1.5 text-foreground shadow-sm hover:bg-muted dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.15] dark:hover:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF58D5] to-[#4E6EFF] text-white">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
          Tonton Video Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl overflow-hidden border-none bg-black p-0 text-white sm:rounded-2xl">
        <DialogTitle className="sr-only">Video Profil Program Studi PTIK</DialogTitle>
        {url && yt ? (
          <div className="aspect-video w-full">
            <iframe
              src={yt}
              className="h-full w-full"
              title="Video Profil Program Studi"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : url && isFile ? (
          <video src={url} controls autoPlay className="aspect-video w-full bg-black" />
        ) : url ? (
          <div className="aspect-video w-full">
            <iframe src={url} className="h-full w-full" title="Video Profil Program Studi" allowFullScreen />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#171f2e] to-[#0b0d16] px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF58D5] to-[#4E6EFF]">
              <Play className="h-6 w-6 fill-current text-white" />
            </span>
            <p className="text-lg font-semibold text-white">Video profil program studi segera hadir</p>
            <p className="max-w-sm text-sm text-white/60">
              Admin dapat menautkan video (YouTube atau file) melalui pengaturan situs.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Hero floating chips ─────────────────────────── */

type Chip = {
  icon: typeof Newspaper;
  label: string;
  to: string;
  hue: string;
  wrap: string;
  tail: string;
  float: string;
};

const CHIPS: Chip[] = [
  { icon: Newspaper, label: "Berita & Informasi", to: "/berita", hue: "var(--m-berita)", wrap: "left-0 top-24 xl:-left-6", tail: "-bottom-2 right-8", float: "float-y" },
  { icon: ImageIcon, label: "Galeri Kegiatan", to: "/galeri", hue: "var(--m-galeri)", wrap: "right-0 top-40 xl:-right-4", tail: "-bottom-2 left-8", float: "float-x" },
  { icon: BookOpen, label: "Info Akademik", to: "/akademik", hue: "var(--m-alumni)", wrap: "bottom-8 left-6 xl:left-10", tail: "-top-2 right-8", float: "float-xy" },
  { icon: UserPlus, label: "Pendaftaran", to: "/daftar", hue: "var(--m-pendaftaran)", wrap: "bottom-14 right-4 xl:right-12", tail: "-top-2 left-8", float: "float-rev" },
];

function FloatingChip({ chip }: { chip: Chip }) {
  const Icon = chip.icon;
  const down = !chip.tail.includes("-top");
  return (
    <Link
      to={chip.to}
      style={{ ["--c" as string]: chip.hue } as CSSProperties}
      className={`group absolute z-10 hidden items-center gap-2.5 rounded-2xl border border-[hsl(var(--c)/0.18)] bg-[hsl(var(--c)/0.08)] px-3 py-2.5 shadow-soft backdrop-blur-md transition-colors duration-300 hover:bg-[hsl(var(--c)/0.14)] dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.09] lg:inline-flex ${chip.float} ${chip.wrap}`}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ backgroundImage: "linear-gradient(180deg, hsl(var(--c)), hsl(var(--c) / 0.7))" }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="pr-1 text-sm font-medium text-[color:hsl(var(--c))]">{chip.label}</span>
      {/* rounded triangle pointer, like the template's tail */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={`absolute h-4 w-4 ${down ? "" : "rotate-180"} ${chip.tail}`}
        style={{ color: "hsl(var(--c))" }}
      >
        <path d="M5 5 L19 5 Q21 5 20 7 L13 19 Q12 21 11 19 L4 7 Q3 5 5 5 Z" />
      </svg>
    </Link>
  );
}

/* ─────────────────────────── Core features ─────────────────────────── */

const FEATURES = [
  { icon: BookOpen, title: "Kurikulum Relevan Industri", desc: "Materi pembelajaran yang selaras dengan kebutuhan dunia kerja dan perkembangan teknologi terkini." },
  { icon: GraduationCap, title: "Dosen Berkualitas", desc: "Tenaga pengajar bersertifikasi dan berpengalaman di bidang teknologi informasi & pendidikan." },
  { icon: FlaskConical, title: "Riset & Inovasi Aktif", desc: "Budaya penelitian yang inovatif, aplikatif, dan berdampak nyata bagi masyarakat." },
  { icon: Cpu, title: "Fasilitas Modern", desc: "Laboratorium komputer dan sarana belajar yang menunjang praktik dan eksplorasi teknologi." },
  { icon: Award, title: "Lulusan Kompeten", desc: "Alumni siap kerja, adaptif, dan berdaya saing di berbagai sektor industri teknologi." },
  { icon: Users, title: "Jaringan Alumni Luas", desc: "Komunitas alumni yang tersebar dan saling mendukung pengembangan karier serta kolaborasi." },
];

function FeatureCard({ icon: Icon, title, desc }: (typeof FEATURES)[number]) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-8 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow-hover">
      <div className="feature-glow mb-8 flex h-[76px] w-[76px] items-center justify-center rounded-full text-white">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-foreground md:text-2xl">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ─────────────────────────── Tabbed showcase ─────────────────────────── */

const TABS = [
  { id: "akademik", label: "Akademik", icon: BookOpen, to: "/akademik", title: "Informasi Akademik Lengkap", desc: "Kalender akademik, panduan studi, dan berkas penting tersedia dalam satu portal yang mudah diakses." },
  { id: "berita", label: "Berita", icon: Newspaper, to: "/berita", title: "Berita & Pengumuman Terkini", desc: "Ikuti kabar terbaru, prestasi, dan agenda penting dari program studi secara real-time." },
  { id: "galeri", label: "Galeri", icon: ImageIcon, to: "/galeri", title: "Galeri Kegiatan & Fasilitas", desc: "Dokumentasi visual kegiatan mahasiswa, kompetisi, dan fasilitas kampus program studi." },
  { id: "kewirausahaan", label: "IT Solution", icon: Rocket, to: "/kewirausahaan", title: "Kewirausahaan & IT Solution", desc: "Wadah pengembangan produk dan layanan teknologi karya sivitas akademika program studi." },
  { id: "kontak", label: "Kontak", icon: Phone, to: "/kontak", title: "Hubungi Program Studi", desc: "Tim kami siap membantu menjawab pertanyaan seputar akademik, pendaftaran, dan layanan lainnya." },
];

type BeritaItem = { id: string | number; judul: string; gambar?: string; tanggal?: string; ringkasan?: string };
type GaleriItem = { id: string | number; judul: string; gambar?: string };

function TabPreview({
  tabId,
  berita,
  galeri,
  get,
}: {
  tabId: string;
  berita: BeritaItem[];
  galeri: GaleriItem[];
  get: (k: string, f?: string) => string;
}) {
  if (tabId === "akademik") {
    const rows = [
      { k: "Jenjang", v: get("akademik_jenjang", "Sarjana (S1)") },
      { k: "Total SKS", v: get("akademik_sks", "144 SKS") },
      { k: "Masa Studi", v: get("akademik_masa", "8 Semester") },
    ];
    return (
      <div className="space-y-3">
        {rows.map((x) => (
          <div key={x.k} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">{x.k}</span>
            <span className="font-semibold text-foreground">{x.v}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tabId === "berita") {
    if (!berita.length) return <TabEmpty icon={Newspaper} text="Belum ada berita." />;
    return (
      <div className="space-y-3">
        {berita.slice(0, 3).map((b) => (
          <Link
            key={b.id}
            to={`/berita/${b.id}`}
            className="group flex gap-3 rounded-xl border border-border bg-background/60 p-2.5 transition-colors hover:border-primary/40"
          >
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {b.gambar ? (
                <img src={b.gambar} alt={b.judul} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-primary"><Newspaper className="h-5 w-5" /></div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" /> {b.tanggal || "—"}
              </div>
              <div className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">{b.judul}</div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (tabId === "galeri") {
    if (!galeri.length) return <TabEmpty icon={ImageIcon} text="Belum ada galeri." />;
    return (
      <div className="grid grid-cols-2 gap-3">
        {galeri.slice(0, 4).map((g) => (
          <div key={g.id} className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            {g.gambar && <img src={g.gambar} alt={g.judul} className="h-full w-full object-cover" />}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <span className="line-clamp-1 text-[11px] font-medium text-white">{g.judul}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tabId === "kewirausahaan") {
    return (
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <Rocket className="h-8 w-8 text-primary" />
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {get(
            "kewirausahaan_intro",
            "PTIK IT Solution adalah wadah kewirausahaan berbasis teknologi bagi sivitas akademika untuk mengembangkan produk dan layanan digital yang aplikatif.",
          )}
        </p>
      </div>
    );
  }

  // kontak
  const kontak = [
    { icon: MapPin, v: get("kontak_alamat", "Kampus Program Studi PTIK, Indonesia") },
    { icon: Mail, v: get("kontak_email", "info@ptik.ac.id") },
    { icon: Phone, v: get("kontak_telepon", "(0751) 000-000") },
  ];
  return (
    <div className="space-y-3">
      {kontak.map((x, i) => {
        const XIcon = x.icon;
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <XIcon className="h-4 w-4" />
            </span>
            <span className="text-sm text-foreground">{x.v}</span>
          </div>
        );
      })}
    </div>
  );
}

function TabEmpty({ icon: Icon, text }: { icon: typeof Newspaper; text: string }) {
  return (
    <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 text-muted-foreground">
      <Icon className="h-7 w-7" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function ToolsTabs({ berita, galeri, get }: { berita: BeritaItem[]; galeri: GaleriItem[]; get: (k: string, f?: string) => string }) {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  const Icon = tab.icon;

  return (
    <div className="mx-auto max-w-4xl">
      {/* pill tab bar */}
      <div className="mx-auto max-w-fit overflow-x-auto scrollbar-thin">
        <div className="flex min-w-max gap-1 rounded-full border border-border bg-muted/60 p-1">
          {TABS.map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${active === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                  }`}
              >
                <TIcon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* showcase panel */}
      <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-[#FF58D5]/15 to-[#4E6EFF]/15 p-3 sm:p-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          {/* faux window bar */}
          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-12">
            <div>
              <div className="feature-glow mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{tab.title}</h3>
              <p className="mt-3 text-muted-foreground">{tab.desc}</p>
              <Button className="mt-6 rounded-full" asChild>
                <Link to={tab.to}>
                  Buka halaman <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {/* live content preview */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <TabPreview tabId={tab.id} berita={berita} galeri={galeri} get={get} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Testimonials ─────────────────────────── */

const AV_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  return (
    <div className="rounded-[20px] border border-border bg-card/60 p-2 transition-colors hover:border-primary/40">
      <div className="mb-3 flex items-center gap-4 rounded-2xl bg-background/60 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AV_GRADIENTS[i % AV_GRADIENTS.length]} text-sm font-bold text-white`}>
          {initials(t.name)}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t.name}</h3>
          <p className="text-sm text-muted-foreground">{t.role}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-background/60 p-5">
        <Quote className="mb-2 h-5 w-5 text-primary/50" />
        <p className="leading-relaxed text-muted-foreground">{t.quote}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group card-hairline rounded-2xl border border-border bg-card px-5 shadow-soft">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-foreground [&::-webkit-details-marker]:hidden">
        {q}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-open:rotate-45">
          <Plus className="h-4 w-4" />
        </span>
      </summary>
      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}

/* ─────────────────────────── Section heading ─────────────────────────── */

function SectionHead({ title, subtitle, light = false }: { title: string; subtitle: string; light?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <h2 className={`font-display text-3xl font-medium tracking-[-0.02em] md:text-[2.75rem] md:leading-tight ${light ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      <p className={`mt-3 leading-6 ${light ? "text-white/60" : "text-muted-foreground"}`}>{subtitle}</p>
    </div>
  );
}

/* ═══════════════════════════════ Page ═══════════════════════════════ */

export default function HomePage() {
  const { data: berita = [] } = useQuery({ queryKey: ["public", "berita"], queryFn: listBeritaPublic });
  const { data: galeri = [] } = useQuery({ queryKey: ["public", "galeri"], queryFn: listGaleriPublic });
  const { get } = useSiteContent();
  const [showAllT, setShowAllT] = useState(false);

  const stats = [
    { value: get("home_stat1_value", "B"), label: get("home_stat1_label", "Akreditasi") },
    { value: get("home_stat2_value", "500+"), label: get("home_stat2_label", "Alumni") },
    { value: get("home_stat3_value", "25+"), label: get("home_stat3_label", "Dosen") },
    { value: get("home_stat4_value", "2010"), label: get("home_stat4_label", "Berdiri") },
  ];

  const testimonials = parseTestimonials(get("home_testimonials", ""));
  const faqs = parseFaqs(get("home_faq", ""));
  const visibleT = showAllT ? testimonials : testimonials.slice(0, 6);

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="hero-surface relative overflow-hidden">
        {/* grid + strong glows only in dark; light mode stays clean like the template */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)] dark:opacity-40" />
        <div className="pointer-events-none absolute left-[58%] top-0 hidden h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#4E6EFF]/40 blur-[120px] animate-aurora dark:block" />
        <div className="pointer-events-none absolute left-[38%] top-0 hidden h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#FF58D5]/25 blur-[120px] dark:block" />
        {/* soft bottom-center glow (both themes) */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-[50%] bg-primary/10 blur-[110px] dark:bg-primary/25" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 md:px-6 md:pb-28 md:pt-28">
          {CHIPS.map((c) => (
            <FloatingChip key={c.label} chip={c} />
          ))}

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-gradient-to-r from-[#FF58D5]/60 to-[#4E6EFF]/60 p-0.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 dark:bg-[#171f2e] dark:text-white/90">
                <Sparkles className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-300" />
                {get("home_badge", "Program Studi Terakreditasi")}
              </span>
            </span>

            <h1 className="mx-auto mt-7 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-transparent dark:from-white dark:to-white/60 sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {get("home_hero_title", "Wujudkan Masa Depan bersama Teknologi Informatika & Komputer")}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-gray-500 dark:text-white/70 md:text-lg">
              {get("home_hero_subtitle", "Mencetak pendidik dan profesional teknologi yang kompeten, adaptif, dan berdaya saing global.")}
            </p>

            <div className="relative z-30 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-violet-900/30 hover:bg-primary/90" asChild>
                <Link to="/akademik">
                  Info Akademik <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <VideoDialog url={get("home_video_url", "")} />
            </div>
          </div>

          {/* Stats strip */}
          <div className="relative mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/70 p-4 text-center shadow-soft backdrop-blur-md dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none">
                <div className="font-display text-3xl font-medium tabular-nums text-foreground">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground dark:text-white/55">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Core Features ── */}
      <section className="bg-muted/30 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead title="Kenapa Memilih PTIK?" subtitle="Lingkungan belajar teknologi yang unggul, aplikatif, dan mendukung pengembangan diri secara menyeluruh." />
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabbed showcase ── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead title="Jelajahi Semua Layanan Program Studi" subtitle="Semua informasi dan layanan yang Anda butuhkan, tersaji dalam satu portal yang mudah diakses." />
          <ToolsTabs berita={berita} galeri={galeri} get={get} />
        </div>
      </section>

      {/* ── Benefits (dark) ── */}
      <section className="bg-gray-900 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead light title="Keunggulan Belajar di PTIK" subtitle="Bekal akademik dan pengalaman nyata yang menyiapkan Anda untuk berkarier dan berkontribusi." />
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-12">
            {/* big primary card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-primary p-9 md:p-12 lg:col-span-7">
              <div className="max-w-sm">
                <h3 className="text-2xl font-bold text-white md:text-3xl">Lulusan Siap Kerja & Berdaya Saing</h3>
                <p className="mt-4 text-white/70">
                  Perpaduan kompetensi pedagogik dan keahlian teknis membuat lulusan PTIK mudah beradaptasi di dunia
                  pendidikan maupun industri teknologi.
                </p>
              </div>
              <div className="mt-16 flex flex-wrap gap-3">
                {["Software Engineer", "Guru TIK", "IT Consultant"].map((r) => (
                  <span key={r} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                    {r}
                  </span>
                ))}
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>

            {/* right column: teal + dark */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              <div className="benefits-bg rounded-[20px] p-9">
                <FlaskConical className="mb-4 h-8 w-8 text-white" />
                <h3 className="text-xl font-bold text-white">Riset & Inovasi Terapan</h3>
                <p className="mt-2 text-sm text-white/80">Terlibat dalam penelitian dan proyek nyata yang berdampak sejak masa kuliah.</p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-9">
                <Users className="mb-4 h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold text-white">Jaringan Alumni Luas</h3>
                <p className="mt-2 text-sm text-white/60">Terhubung dengan komunitas alumni yang mendukung pengembangan karier Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Berita terbaru ── */}
      <section className="border-b border-border px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">Berita Terbaru</h2>
              <p className="mt-2 text-muted-foreground">Kabar terkini dari program studi.</p>
            </div>
            <Button variant="ghost" asChild className="hidden rounded-full sm:inline-flex">
              <Link to="/berita">
                Lihat semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {berita.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center text-sm text-muted-foreground">
              Belum ada berita.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {berita.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  to={`/berita/${b.id}`}
                  className="group overflow-hidden rounded-[20px] border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow-hover"
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {b.gambar ? (
                      <img src={b.gambar} alt={b.judul} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-fuchsia-500/10 text-primary">
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

      {/* ── Galeri preview ── */}
      {galeri.length > 0 && (
        <section className="border-b border-border px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">Galeri</h2>
                <p className="mt-2 text-muted-foreground">Dokumentasi kegiatan & fasilitas.</p>
              </div>
              <Button variant="ghost" asChild className="hidden rounded-full sm:inline-flex">
                <Link to="/galeri">
                  Lihat semua <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
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
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="relative px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead title="Apa Kata Alumni & Mahasiswa" subtitle="Pengalaman nyata dari mereka yang telah menempuh pendidikan di Program Studi PTIK." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleT.map((t, i) => (
              <TestimonialCard key={t.name + i} t={t} i={i} />
            ))}
          </div>
          {testimonials.length > 6 && (
            <div className="relative z-10 mt-10 text-center">
              <Button variant="outline" className="rounded-full" onClick={() => setShowAllT((v) => !v)}>
                {showAllT ? "Tampilkan lebih sedikit" : "Tampilkan lebih banyak"}
              </Button>
            </div>
          )}
        </div>
        {!showAllT && testimonials.length > 6 && (
          <div className="fade-to-bg pointer-events-none absolute inset-x-0 bottom-0 h-56" />
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-muted/30 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <SectionHead title="Pertanyaan Umum" subtitle="Hal-hal yang sering ditanyakan tentang program studi." />
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="px-4 py-16 md:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#171f2e] p-8 text-center text-white shadow-soft-lg md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="pointer-events-none absolute left-1/2 top-[-40%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#4E6EFF]/40 blur-[100px] animate-aurora" />
          <div className="pointer-events-none absolute right-[20%] top-[-30%] h-56 w-56 rounded-full bg-[#FF58D5]/25 blur-[100px]" />
          <h2 className="relative font-display text-2xl font-medium tracking-[-0.01em] md:text-3xl">Siap bergabung bersama PTIK?</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/70 md:text-base">
            Wujudkan langkah pertama menuju karier di dunia teknologi dan pendidikan. Tim kami siap membantu Anda.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-violet-900/40 hover:bg-primary/90" asChild>
              <Link to="/daftar">
                Daftar Sekarang <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
              <Link to="/kontak">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
