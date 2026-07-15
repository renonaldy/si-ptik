import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquareQuote,
  Users,
  MapPin,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Hash,
  Award,
  BadgeCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useSiteContent } from "@/features/content/useSiteContent";
import { listDosenPublic, type DosenPublic } from "@/lib/api/publicApi";

type Ctx = {
  get: (k: string, f?: string) => string;
  getList: (k: string, f?: string[]) => string[];
};

export type Topic = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  render: (c: Ctx) => ReactNode;
};

/* ─────────────── Kurikulum (matakuliah) table ─────────────── */

export type Course = { kode: string; nama: string; teori: number; praktek: number };
export const SEM_COUNT = 8;

// Seed data (from the reference). Admin can override each semester via CMS keys
// `kurikulum_sem{n}` (one course per line: "Kode | Nama MK | Teori | Praktek")
// and `kurikulum_sem{n}_tema`.
export const KURIKULUM_SEED: Record<number, { tema: string; lines: string[] }> = {
  1: {
    tema: "Fondasi Karakter & Dasar Informatika",
    lines: [
      "0002611201 | Agama | 2 | 0",
      "0002611202 | Pancasila | 2 | 0",
      "0002611203 | Ke-BungHatta-an | 2 | 0",
      "0002611204 | Bahasa Inggris Informatika | 2 | 0",
      "7712612210 | Pengantar Informatika dan Komputasi | 2 | 0",
      "7712612311 | Logika Matematika | 3 | 0",
      "7712613314 | Algoritma dan Pemrograman | 3 | 0",
      "7712613115 | Praktikum Algoritma dan Pemrograman | 0 | 1",
      "7712613316 | Sistem Digital dan Komputasi | 2 | 1",
    ],
  },
};

export function parseCourses(lines: string[]): Course[] {
  return lines
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((p) => p[1])
    .map((p) => ({ kode: p[0] ?? "", nama: p[1] ?? "", teori: Number(p[2]) || 0, praktek: Number(p[3]) || 0 }));
}

function KurikulumTable({ no, tema, courses }: { no: number; tema?: string; courses: Course[] }) {
  const tT = courses.reduce((a, c) => a + c.teori, 0);
  const tP = courses.reduce((a, c) => a + c.praktek, 0);
  const th = "px-4 py-3 text-center font-semibold";
  const td = "px-4 py-2.5 text-center text-foreground";
  return (
    <div>
      <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em] text-foreground">
        Matakuliah Semester {no}
        {tema ? <span className="text-muted-foreground"> — {tema}</span> : null}
      </h3>
      <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#14346e] text-white">
              <th rowSpan={2} className={`${th} w-14`}>No</th>
              <th rowSpan={2} className={th}>Kode</th>
              <th rowSpan={2} className={`${th} text-left`}>Nama MK</th>
              <th colSpan={3} className={`${th} border-l border-white/20`}>SKS</th>
            </tr>
            <tr className="bg-[#14346e] text-white">
              <th className={`${th} border-l border-white/20`}>Teori</th>
              <th className={th}>Praktek</th>
              <th className={th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={i} className={i % 2 ? "bg-muted/40" : "bg-card"}>
                <td className={td}>{i + 1}</td>
                <td className={`${td} whitespace-nowrap text-muted-foreground`}>{c.kode}</td>
                <td className="px-4 py-2.5 text-left text-foreground">{c.nama}</td>
                <td className={td}>{c.teori}</td>
                <td className={td}>{c.praktek}</td>
                <td className={`${td} font-medium`}>{c.teori + c.praktek}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#14346e] font-semibold text-white">
              <td colSpan={3} className="px-4 py-3 text-right">Total</td>
              <td className="px-4 py-3 text-center">{tT}</td>
              <td className="px-4 py-3 text-center">{tP}</td>
              <td className="px-4 py-3 text-center">{tT + tP}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ─────────────── Dosen (cards + biodata modal) ─────────────── */

function DosenAvatar({ foto, alt, className }: { foto?: string; alt: string; className: string }) {
  if (foto) return <img src={foto} alt={alt} className={`${className} rounded-full object-cover`} />;
  return (
    <span className={`${className} flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-white`}>
      <GraduationCap className="h-1/2 w-1/2" />
    </span>
  );
}

function DosenPublicSection() {
  const { get, getList } = useSiteContent();
  const { data: dosen = [], isLoading } = useQuery({ queryKey: ["public", "dosen"], queryFn: listDosenPublic, retry: false });
  const [selected, setSelected] = useState<DosenPublic | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (child) track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let idx = 0;
    let best = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - track.scrollLeft);
      if (d < best) { best = d; idx = i; }
    });
    setActive(idx);
  };

  // Fallback when the public endpoint isn't available yet or returns nothing.
  if (!isLoading && dosen.length === 0) {
    return (
      <div className="card-hairline flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:flex-row md:items-center md:p-8">
        <div className="flex-1 space-y-3 text-muted-foreground">
          {getList("profil_dosen_teks", [
            "Program Studi PTIK didukung oleh tenaga pengajar bersertifikasi dan berpengalaman di bidang teknologi informasi serta pendidikan.",
            "Para dosen aktif dalam penelitian, pengabdian masyarakat, dan pengembangan keilmuan untuk menghadirkan pembelajaran yang relevan dan berkualitas.",
          ]).map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>
        <div className="shrink-0 rounded-2xl border border-border bg-muted/30 p-6 text-center">
          <div className="font-display text-4xl font-medium text-primary">{get("profil_dosen_jumlah", "25+")}</div>
          <div className="mt-1 text-sm text-muted-foreground">Dosen Pengajar</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* carousel controls */}
        {dosen.length > 1 && (
          <>
            <button
              onClick={() => goTo(active - 1)}
              aria-label="Sebelumnya"
              className="absolute -left-3 top-[6.5rem] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-muted md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              aria-label="Berikutnya"
              className="absolute -right-3 top-[6.5rem] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-muted md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-thin"
        >
          {dosen.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="card-hairline shadow-glow-hover group shrink-0 basis-full snap-start overflow-hidden rounded-2xl border border-border bg-card text-center shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(25%-0.75rem)]"
            >
              <div className="h-20 bg-gradient-to-br from-primary/25 to-fuchsia-500/15" />
              <div className="-mt-12 px-5 pb-6">
                <DosenAvatar foto={d.foto} alt={d.nama_dosen} className="mx-auto h-24 w-24 ring-4 ring-card" />
                <div className="mt-3 line-clamp-1 font-semibold text-foreground group-hover:text-primary">{d.nama_dosen}</div>
                <div className="text-sm text-muted-foreground">{d.jabatan || "Dosen"}</div>
                <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                  Lihat biodata
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* dot pagination */}
        {dosen.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {dosen.map((d, i) => (
              <button
                key={d.id}
                onClick={() => goTo(i)}
                aria-label={`Ke kartu ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Biodata Dosen</DialogTitle>
          {selected && (
            <div className="text-center">
              <DosenAvatar foto={selected.foto} alt={selected.nama_dosen} className="mx-auto h-28 w-28 ring-4 ring-primary/15" />
              <h3 className="mt-4 font-display text-xl font-medium text-foreground">{selected.nama_dosen}</h3>
              <p className="text-sm text-muted-foreground">{selected.jabatan || "Dosen"}</p>
              <div className="mt-5 space-y-2 text-left">
                {[
                  { icon: Hash, k: "NIDN", v: selected.nidn },
                  { icon: Award, k: "Pangkat", v: selected.pangkat },
                  { icon: BadgeCheck, k: "Status", v: selected.status },
                ]
                  .filter((r) => r.v)
                  .map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.k} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">{r.k}</span>
                        <span className="text-sm text-foreground">{r.v}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────── "Tentang" topics (each its own page) ─────────────── */

export const TENTANG_TOPICS: Record<string, Topic> = {
  sambutan: {
    eyebrow: "Tentang",
    title: "Sambutan",
    subtitle: "Sambutan dari pimpinan Program Studi PTIK.",
    render: ({ get, getList }) => (
      <div className="card-hairline grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:grid-cols-[220px_1fr] md:p-8">
        <div className="mx-auto w-full max-w-[220px]">
          {get("profil_sambutan_foto", "") ? (
            <img src={get("profil_sambutan_foto", "")} alt="Foto Ketua Program Studi" className="aspect-[3/4] w-full rounded-xl object-cover shadow-soft" />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-fuchsia-500/10 text-primary">
              <Users className="h-12 w-12" />
            </div>
          )}
        </div>
        <div>
          <MessageSquareQuote className="h-8 w-8 text-primary/30" />
          <div className="mt-2 space-y-3 text-muted-foreground">
            {getList("profil_sambutan_teks", [
              "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di portal resmi Program Studi Pendidikan Teknik Informatika dan Komputer (PTIK).",
              "Kami berkomitmen mencetak pendidik dan profesional teknologi yang kompeten, adaptif, dan berdaya saing. Semoga portal ini bermanfaat sebagai sumber informasi akademik dan layanan program studi.",
            ]).map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
          <div className="mt-5">
            <div className="font-semibold text-foreground">{get("profil_sambutan_nama", "Ketua Program Studi")}</div>
            <div className="text-sm text-muted-foreground">{get("profil_sambutan_jabatan", "Ketua Program Studi PTIK")}</div>
          </div>
        </div>
      </div>
    ),
  },

  profil: {
    eyebrow: "Tentang",
    title: "Profil Program Studi",
    subtitle: "Mengenal Program Studi Pendidikan Teknik Informatika dan Komputer.",
    render: ({ getList }) => (
      <div className="card-hairline space-y-4 rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-soft md:p-8">
        {getList("profil_deskripsi", [
          "Program Studi Pendidikan Teknik Informatika dan Komputer (PTIK) adalah program pendidikan sarjana yang memadukan penguasaan bidang teknologi informasi dengan kompetensi kependidikan.",
          "Kurikulum dirancang relevan dengan kebutuhan industri dan dunia pendidikan, ditopang tenaga pengajar berkualitas serta fasilitas praktik yang memadai, sehingga lulusan siap berkarier sebagai pendidik maupun profesional teknologi.",
        ]).map((p, i) => (
          <p key={i} className="leading-relaxed">{p}</p>
        ))}
      </div>
    ),
  },

  logo: {
    eyebrow: "Tentang",
    title: "Logo",
    subtitle: "Identitas visual Program Studi PTIK.",
    render: ({ get, getList }) => (
      <div className="card-hairline grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:grid-cols-[240px_1fr] md:p-8">
        <div className="flex items-center justify-center rounded-xl bg-muted/40 p-6">
          {get("profil_logo", "") ? (
            <img src={get("profil_logo", "")} alt="Logo Program Studi PTIK" className="max-h-44 w-auto object-contain" />
          ) : (
            <BrandLogo className="max-h-44 w-auto" />
          )}
        </div>
        <div className="space-y-3 text-muted-foreground">
          {getList("profil_logo_makna", [
            "Logo Program Studi PTIK merepresentasikan semangat pendidikan dan teknologi yang berpadu.",
            "Warna dan bentuknya melambangkan inovasi, integritas, dan pertumbuhan berkelanjutan sivitas akademika.",
          ]).map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>
      </div>
    ),
  },

  akreditasi: {
    eyebrow: "Tentang",
    title: "Akreditasi",
    subtitle: "Status mutu penyelenggaraan pendidikan program studi.",
    render: ({ get }) => (
      <div className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {[
            { k: "Peringkat", v: get("profil_akreditasi_peringkat", "Baik Sekali") },
            { k: "Lembaga", v: get("profil_akreditasi_lembaga", "BAN-PT") },
            { k: "Berlaku s.d.", v: get("profil_akreditasi_berlaku", "—") },
          ].map((x) => (
            <div key={x.k} className="bg-card p-6 text-center">
              <div className="text-sm text-muted-foreground">{x.k}</div>
              <div className="mt-1 font-display text-2xl font-medium text-foreground">{x.v}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-6 text-muted-foreground md:p-8">
          <p className="leading-relaxed">
            {get("profil_akreditasi_teks", "Program Studi PTIK telah terakreditasi oleh lembaga akreditasi nasional sebagai bukti komitmen terhadap mutu penyelenggaraan pendidikan.")}
          </p>
          {get("profil_akreditasi_sk", "") && <p className="mt-2 text-sm text-muted-foreground">No. SK: {get("profil_akreditasi_sk", "")}</p>}
        </div>
      </div>
    ),
  },

  dosen: {
    eyebrow: "Tentang",
    title: "Dosen",
    subtitle: "Tenaga pengajar Program Studi PTIK. Klik kartu untuk melihat biodata.",
    render: () => <DosenPublicSection />,
  },

  lokasi: {
    eyebrow: "Tentang",
    title: "Lokasi Kampus",
    subtitle: "Temukan lokasi kampus Program Studi PTIK.",
    render: ({ get }) => {
      const maps = get("profil_lokasi_maps", "");
      const alamat = get("profil_lokasi_alamat", "") || get("kontak_alamat", "Kampus Program Studi PTIK, Indonesia");
      return (
        <div className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {maps ? (
            <div className="aspect-[16/7] w-full">
              <iframe src={maps} className="h-full w-full border-0" loading="lazy" title="Lokasi Kampus" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center bg-muted/40 text-muted-foreground">
              <MapPin className="h-10 w-10" />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {alamat}
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Buka di Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      );
    },
  },

  "media-sosial": {
    eyebrow: "Tentang",
    title: "Media Sosial",
    subtitle: "Ikuti kanal resmi Program Studi PTIK.",
    render: ({ get }) => {
      const socials = [
        { icon: Instagram, label: "Instagram", url: get("profil_ig", ""), hint: "@ptik" },
        { icon: Facebook, label: "Facebook", url: get("profil_fb", ""), hint: "Program Studi PTIK" },
        { icon: Youtube, label: "YouTube", url: get("profil_yt", ""), hint: "PTIK Channel" },
        { icon: Globe, label: "Website", url: get("profil_web", ""), hint: "ptik.ac.id" },
      ];
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.url || "#"}
                target={s.url ? "_blank" : undefined}
                rel="noreferrer"
                className="card-hairline shadow-glow-hover group flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{s.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.hint}</div>
                </div>
              </a>
            );
          })}
        </div>
      );
    },
  },
};

/* ─────────────── "Akademik" topics (each its own page) ─────────────── */

export const AKADEMIK_TOPICS: Record<string, Topic> = {
  kurikulum: {
    eyebrow: "Akademik",
    title: "Kurikulum",
    subtitle: "Struktur matakuliah Program Studi PTIK per semester.",
    render: ({ get, getList }) => {
      const semesters = Array.from({ length: SEM_COUNT }, (_, i) => i + 1)
        .map((n) => ({
          n,
          tema: get(`kurikulum_sem${n}_tema`, KURIKULUM_SEED[n]?.tema ?? ""),
          courses: parseCourses(getList(`kurikulum_sem${n}`, KURIKULUM_SEED[n]?.lines ?? [])),
        }))
        .filter((s) => s.courses.length > 0);

      return (
        <div className="space-y-10">
          <div className="card-hairline space-y-4 rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-soft md:p-8">
            {getList("akademik_kurikulum", [
              "Kurikulum Program Studi PTIK dirancang mengikuti perkembangan teknologi dan kebutuhan dunia kerja, memadukan mata kuliah keilmuan komputer, rekayasa perangkat lunak, jaringan, serta kompetensi kependidikan.",
              "Struktur kurikulum ditempuh dalam 8 semester dengan total 144 SKS, mencakup mata kuliah teori, praktikum di laboratorium, serta kerja praktik dan tugas akhir.",
            ]).map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>

          {semesters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Data matakuliah belum tersedia.
            </div>
          ) : (
            semesters.map((s) => <KurikulumTable key={s.n} no={s.n} tema={s.tema} courses={s.courses} />)
          )}
        </div>
      );
    },
  },

  "profil-lulusan": {
    eyebrow: "Akademik",
    title: "Profil Lulusan",
    subtitle: "Kompetensi dan peran lulusan Program Studi PTIK.",
    render: ({ getList }) => (
      <div className="grid gap-4 sm:grid-cols-2">
        {getList("akademik_profil_lulusan", [
          "Pendidik / Guru bidang Teknologi Informasi & Komputer",
          "Pengembang Perangkat Lunak (Software Developer)",
          "Praktisi & Konsultan Teknologi Informasi",
          "Technopreneur di bidang teknologi digital",
        ]).map((p, i) => (
          <div key={i} className="card-hairline flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm text-primary">{i + 1}</span>
            <p className="text-sm leading-relaxed text-foreground">{p}</p>
          </div>
        ))}
      </div>
    ),
  },

  "prospek-kerja": {
    eyebrow: "Akademik",
    title: "Prospek Kerja",
    subtitle: "Peluang karier bagi lulusan Program Studi PTIK.",
    render: ({ getList }) => (
      <div className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap gap-2.5">
          {getList("akademik_prospek", [
            "Guru / Dosen TIK",
            "Software Engineer",
            "Web Developer",
            "Network Administrator",
            "IT Support & Consultant",
            "Data Analyst",
            "UI/UX Designer",
            "Technopreneur",
          ]).map((p, i) => (
            <span key={i} className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground">{p}</span>
          ))}
        </div>
      </div>
    ),
  },
};

/* Sidebar/other-links used by TopicPage to show sibling topics. */
export const TENTANG_ORDER = ["sambutan", "profil", "logo", "akreditasi", "dosen", "lokasi", "media-sosial"];
export const AKADEMIK_ORDER = ["kurikulum", "profil-lulusan", "prospek-kerja"];
