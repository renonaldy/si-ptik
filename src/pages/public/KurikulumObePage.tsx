import { useMemo, useState } from "react";
import {
  GraduationCap,
  Target,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  FileDown,
  ClipboardList,
  Award,
  Sigma,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/features/content/useSiteContent";
import { useObePublic } from "@/features/obe/hooks/useObe";
import { CPL_KATEGORI, TOTAL_SEMESTER, type PublicCourse } from "@/lib/api/obeApi";

// ── Narrative fallbacks (editable via Pengaturan Situs → Kurikulum OBE) ──

const DEFAULT_PENGERTIAN =
  "Outcome-Based Education (OBE) adalah pendekatan pendidikan yang berfokus pada capaian pembelajaran (outcome) yang harus dikuasai lulusan, bukan sekadar materi yang diajarkan. Seluruh proses — kurikulum, pembelajaran, dan asesmen — dirancang mundur dari profil lulusan yang dituju.";
const DEFAULT_TUJUAN = [
  "Memastikan lulusan menguasai kompetensi yang relevan dengan kebutuhan dunia kerja dan masyarakat.",
  "Menyelaraskan mata kuliah, metode pembelajaran, dan asesmen dengan capaian pembelajaran lulusan (CPL).",
  "Mendukung perbaikan kurikulum berkelanjutan berbasis evaluasi capaian.",
];
const DEFAULT_MANFAAT = [
  "Mahasiswa memahami dengan jelas kompetensi yang akan dicapai di setiap mata kuliah.",
  "Dosen memiliki acuan terukur dalam merancang pembelajaran dan penilaian.",
  "Program studi dapat menunjukkan mutu lulusan secara akuntabel untuk akreditasi.",
];
const DEFAULT_PEO = [
  "Menjadi pendidik bidang teknologi informasi yang profesional, adaptif, dan berakhlak mulia.",
  "Menjadi praktisi/profesional TI yang mampu merancang dan mengelola solusi teknologi.",
  "Mampu mengembangkan diri secara berkelanjutan melalui studi lanjut, riset, atau kewirausahaan.",
];

// Shared section shell: icon tile + heading, consistent with other public pages.
function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: typeof Target;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("scroll-mt-24", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function KurikulumObePage() {
  const { get, getList } = useSiteContent();
  const { data, isLoading } = useObePublic();

  const pengertian = get("obe_pengertian", DEFAULT_PENGERTIAN);
  const tujuan = getList("obe_tujuan", DEFAULT_TUJUAN);
  const manfaat = getList("obe_manfaat", DEFAULT_MANFAAT);
  const peo = getList("obe_peo", DEFAULT_PEO);

  const curriculum = data?.curriculum ?? null;
  const cpls = data?.cpls ?? [];
  const courses = data?.courses ?? [];

  const [openKategori, setOpenKategori] = useState<string | null>(CPL_KATEGORI[0].value);
  const [activeSem, setActiveSem] = useState(1);
  const [detail, setDetail] = useState<PublicCourse | null>(null);

  const cplByKategori = useMemo(() => {
    const m = new Map<string, typeof cpls>();
    for (const c of cpls) m.set(c.kategori, [...(m.get(c.kategori) ?? []), c]);
    return m;
  }, [cpls]);

  const semCourses = useMemo(() => courses.filter((c) => c.semester === activeSem), [courses, activeSem]);
  const countBySem = useMemo(() => {
    const m: Record<number, number> = {};
    for (const c of courses) m[c.semester] = (m[c.semester] ?? 0) + 1;
    return m;
  }, [courses]);
  const totalSks = courses.reduce((a, c) => a + c.sks, 0);
  const rpsCourses = useMemo(() => courses.filter((c) => c.rps_url), [courses]);

  const hasStructure = courses.length > 0;

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em] md:text-5xl">
            Kurikulum Outcome-Based Education
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Implementasi kurikulum berbasis capaian pembelajaran Program Studi PTIK.
          </p>
          {curriculum && (
            <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-inset ring-white/20">
                {curriculum.nama}
              </span>
              {curriculum.tahun && (
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-inset ring-white/20">
                  Tahun {curriculum.tahun}
                </span>
              )}
              {curriculum.nomor_sk && (
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-inset ring-white/20">
                  SK {curriculum.nomor_sk}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick stats strip (only when a curriculum is live) ── */}
      {curriculum && hasStructure && (
        <div className="mx-auto -mt-8 max-w-4xl px-4 md:px-6">
          <div className="card-hairline relative z-10 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-soft">
            {[
              { icon: BookOpen, value: courses.length, label: "Mata Kuliah" },
              { icon: Sigma, value: totalSks, label: "Total SKS" },
              { icon: Target, value: cpls.length, label: "CPL" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-5 text-center">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="font-display text-2xl font-medium tabular-nums text-foreground">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-14 md:px-6">
        {/* ── Tentang OBE ── */}
        <Section icon={Lightbulb} title="Tentang OBE" subtitle="Apa itu Outcome-Based Education?">
          <div className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <p className="leading-relaxed text-muted-foreground">{pengertian}</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" /> Tujuan OBE
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {tujuan.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Manfaat OBE
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {manfaat.map((m, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Profil Lulusan (PEO) ── */}
        <Section
          icon={Award}
          title="Profil Lulusan"
          subtitle="Program Educational Objectives (PEO) — tujuan pendidikan program studi."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peo.map((p, i) => (
              <div key={i} className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CPL (accordion per kategori) ── */}
        <Section
          icon={Target}
          title="Capaian Pembelajaran Lulusan"
          subtitle="CPL dikelompokkan menurut kategori SN-Dikti."
        >
          {cpls.length === 0 ? (
            <div className="card-hairline rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
              {isLoading ? "Memuat…" : "Daftar CPL sedang disiapkan."}
            </div>
          ) : (
            <div className="space-y-3">
              {CPL_KATEGORI.map((k) => {
                const items = cplByKategori.get(k.value) ?? [];
                if (items.length === 0) return null;
                const open = openKategori === k.value;
                return (
                  <div key={k.value} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    <button
                      onClick={() => setOpenKategori(open ? null : k.value)}
                      className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-muted/40"
                      aria-expanded={open}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{k.label}</span>
                        <Badge variant="secondary">{items.length} CPL</Badge>
                      </span>
                      <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                    </button>
                    {open && (
                      <ul className="space-y-3 border-t border-border p-5">
                        {items.map((c) => (
                          <li key={c.id} className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {c.kode || "CPL"}
                            </span>
                            <span className="text-sm leading-relaxed text-muted-foreground">{c.deskripsi}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Struktur Kurikulum ── */}
        <Section
          icon={BookOpen}
          title="Struktur Kurikulum"
          subtitle="Sebaran mata kuliah Semester 1–8. Klik mata kuliah untuk melihat detailnya."
        >
          {!hasStructure ? (
            <div className="card-hairline rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
              {isLoading ? "Memuat…" : "Struktur kurikulum sedang disiapkan."}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: TOTAL_SEMESTER }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setActiveSem(n)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      activeSem === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    Sem {n}
                    <span className={cn("rounded-full px-1.5 text-[11px]", activeSem === n ? "bg-primary/20" : "bg-muted")}>
                      {countBySem[n] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="card-hairline mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                  <span className="text-sm font-medium text-foreground">Semester {activeSem}</span>
                  <span className="text-xs text-muted-foreground">
                    {semCourses.length} MK · {semCourses.reduce((a, c) => a + c.sks, 0)} SKS
                  </span>
                </div>
                {semCourses.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Belum ada mata kuliah di semester ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/20 text-left text-muted-foreground">
                          <th className="w-32 px-5 py-2.5 font-medium">Kode</th>
                          <th className="px-3 py-2.5 font-medium">Mata Kuliah</th>
                          <th className="w-16 px-3 py-2.5 text-center font-medium">SKS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semCourses.map((c) => (
                          <tr
                            key={c.id}
                            onClick={() => setDetail(c)}
                            className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-primary/5"
                            title="Lihat detail mata kuliah"
                          >
                            <td className="px-5 py-3 font-medium text-foreground">{c.kode || "—"}</td>
                            <td className="px-3 py-3 text-foreground">
                              {c.nama}
                              {c.cpl_codes.length > 0 && (
                                <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                                  · {c.cpl_codes.join(", ")}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center text-muted-foreground">{c.sks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </Section>

        {/* ── Dokumen ── */}
        <Section icon={FileDown} title="Dokumen Kurikulum" subtitle="Unduh dokumen resmi kurikulum OBE.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Buku Kurikulum", url: curriculum?.buku_url, icon: BookOpen },
              { label: "Struktur Kurikulum", url: curriculum?.struktur_url, icon: ListChecks },
            ].map((d) =>
              d.url ? (
                <a
                  key={d.label}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hairline group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <d.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground group-hover:text-primary">{d.label}</div>
                    <div className="text-xs text-muted-foreground">Klik untuk mengunduh</div>
                  </div>
                  <FileDown className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </a>
              ) : (
                <div key={d.label} className="card-hairline flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <d.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-muted-foreground">{d.label}</div>
                    <div className="text-xs text-muted-foreground">Belum tersedia</div>
                  </div>
                </div>
              ),
            )}
          </div>

          {rpsCourses.length > 0 && (
            <div className="card-hairline mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
                <ClipboardList className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">RPS Mata Kuliah</span>
                <Badge variant="secondary">{rpsCourses.length}</Badge>
              </div>
              <ul className="divide-y divide-border">
                {rpsCourses.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.rps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-primary/5"
                    >
                      <span className="text-foreground group-hover:text-primary">
                        <span className="font-medium">{c.kode || "MK"}</span> — {c.nama}
                        <span className="ml-2 text-xs text-muted-foreground">Sem {c.semester}</span>
                      </span>
                      <FileDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      </div>

      {/* ── Detail Mata Kuliah dialog ── */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg gap-0 p-0">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary" />
          <div className="border-b border-border bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              {detail?.kode || "Mata Kuliah"} · Semester {detail?.semester} · {detail?.sks} SKS
            </div>
            <DialogTitle className="mt-1.5 font-display text-xl font-medium tracking-[-0.01em]">
              {detail?.nama}
            </DialogTitle>
            <DialogDescription className="mt-1">Detail capaian pembelajaran mata kuliah.</DialogDescription>
          </div>
          <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Deskripsi</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {detail?.deskripsi || "Belum ada deskripsi untuk mata kuliah ini."}
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ListChecks className="h-4 w-4 text-primary" /> CPMK
              </h4>
              {detail && detail.cpmks.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {detail.cpmks.map((m) => (
                    <li key={m.id} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {m.kode || "CPMK"}
                      </span>
                      <span className="text-muted-foreground">
                        {m.deskripsi}
                        {m.level_bloom && <span className="ml-1.5 text-xs">({m.level_bloom})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">Belum ada CPMK.</p>
              )}
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="h-4 w-4 text-primary" /> CPL yang Didukung
              </h4>
              {detail && detail.cpl_codes.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {detail.cpl_codes.map((k) => (
                    <Badge key={k} variant="secondary">{k}</Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">Belum dipetakan ke CPL.</p>
              )}
            </div>
            {detail?.rps_url && (
              <a
                href={detail.rps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <FileDown className="h-4 w-4" /> Unduh RPS mata kuliah ini
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
