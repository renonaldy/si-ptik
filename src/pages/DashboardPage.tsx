import { useNavigate, Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  FileText,
  FlaskConical,
  BookOpen,
  BookMarked,
  FileCheck,
  Award,
  HandCoins,
  Laptop,
  Newspaper,
  Image as ImageIcon,
  Download as DownloadIcon,
  Inbox,
  ArrowRight,
  ClipboardCheck,
  CalendarDays,
  Clock3,
  type LucideIcon,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { useMe } from "@/features/auth/useMe";
import { roleLabel } from "@/features/auth/permissions";
import { useMinuteTick } from "@/hooks/useMinuteTick";
import { accentStyle, type ModuleKey } from "@/lib/moduleColors";
import { effectiveStatus, jenisLabel, statusLabel } from "@/components/ujian/UjianBadges";

import { listDosen } from "@/lib/api/dosenApi";
import { listAlumni } from "@/lib/api/alumniApi";
import { listAdministrasi } from "@/lib/api/administrasiApi";
import { listPenelitian } from "@/lib/api/penelitianApi";
import { listSkripsi } from "@/lib/api/skripsiApi";
import { listSkripsiAlumni } from "@/lib/api/skripsiAlumniApi";
import { listSempro } from "@/lib/api/semproApi";
import { listWisudawan } from "@/lib/api/wisudawanApi";
import { listSumbangan } from "@/lib/api/sumbanganApi";
import { listMicrosoft } from "@/lib/api/microsoftApi";
import { listBerita } from "@/lib/api/beritaApi";
import { listGaleri } from "@/lib/api/galeriApi";
import { listDownload } from "@/lib/api/downloadApi";
import { listPendaftaran } from "@/lib/api/pendaftaranApi";
import { listUjian } from "@/lib/api/ujianApi";

interface ModuleDef {
  key: ModuleKey;
  label: string;
  short: string;
  icon: LucideIcon;
  path: string;
  list: () => Promise<unknown[]>;
}

const MODULES: ModuleDef[] = [
  { key: "dosen", label: "Dosen", short: "Dosen", icon: GraduationCap, path: "/dosen", list: () => listDosen() },
  { key: "alumni", label: "Alumni", short: "Alumni", icon: Users, path: "/alumni", list: () => listAlumni() },
  { key: "penelitian", label: "Penelitian", short: "Riset", icon: FlaskConical, path: "/penelitian", list: () => listPenelitian() },
  { key: "skripsi", label: "Skripsi", short: "Skripsi", icon: BookOpen, path: "/skripsi", list: () => listSkripsi() },
  { key: "skripsi-alumni", label: "Skripsi Alumni", short: "Skr. Alumni", icon: BookMarked, path: "/skripsi-alumni", list: () => listSkripsiAlumni() },
  { key: "sempro", label: "Sempro", short: "Sempro", icon: FileCheck, path: "/sempro", list: () => listSempro() },
  { key: "wisudawan", label: "Wisudawan", short: "Wisuda", icon: Award, path: "/wisudawan", list: () => listWisudawan() },
  { key: "administrasi", label: "Administrasi", short: "Adm.", icon: FileText, path: "/administrasi", list: () => listAdministrasi() },
  { key: "sumbangan", label: "Sumbangan", short: "Sumb.", icon: HandCoins, path: "/sumbangan", list: () => listSumbangan() },
  { key: "microsoft", label: "Pelatihan MS", short: "Pelatihan", icon: Laptop, path: "/microsoft", list: () => listMicrosoft() },
  { key: "berita", label: "Berita", short: "Berita", icon: Newspaper, path: "/kelola/berita", list: () => listBerita() },
  { key: "galeri", label: "Galeri", short: "Galeri", icon: ImageIcon, path: "/kelola/galeri", list: () => listGaleri() },
  { key: "download", label: "Download", short: "Unduh", icon: DownloadIcon, path: "/kelola/download", list: () => listDownload() },
  { key: "pendaftaran", label: "Pendaftaran", short: "Daftar", icon: Inbox, path: "/kelola/pendaftaran", list: () => listPendaftaran() },
];

// Modules shown in the progress list (academic focus).
const CHART_KEYS: ModuleKey[] = ["dosen", "alumni", "skripsi", "sempro", "wisudawan", "penelitian", "administrasi", "sumbangan"];

// Maps an ISO date to an academic semester bucket (Jul–Dec = Ganjil, Jan–Jun = Genap).
function semesterBucket(dateStr?: string): { key: string; sem: string; year: number; sort: number } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const ganjil = d.getMonth() + 1 >= 7;
  return { key: `${year}-${ganjil ? 1 : 0}`, sem: ganjil ? "Ganjil" : "Genap", year, sort: year * 2 + (ganjil ? 1 : 0) };
}
// Featured colorful cards (like the reference "Your courses" row).
const FEATURED: ModuleKey[] = ["dosen", "alumni", "skripsi", "wisudawan"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  useMinuteTick();

  const results = useQueries({
    queries: MODULES.map((m) => ({ queryKey: [m.key, { search: "" }], queryFn: m.list })),
  });
  const { data: ujian = [] } = useQuery({ queryKey: ["ujian", { search: "" }], queryFn: () => listUjian() });

  const byKey = (k: ModuleKey) => MODULES.findIndex((m) => m.key === k);
  const countOf = (k: ModuleKey) => (results[byKey(k)]?.data as unknown[] | undefined)?.length ?? 0;
  const mod = (k: ModuleKey) => MODULES[byKey(k)];

  const total = MODULES.reduce((a, m) => a + countOf(m.key), 0);
  const chartMax = Math.max(1, ...CHART_KEYS.map((k) => countOf(k)));
  const anyLoading = results.some((r) => r.isLoading);

  // Per-semester statistics for Sempro, Wisudawan & Kompre.
  // Sempro/Kompre come from ujian (jenis + exam date); Wisudawan from tanggal_sidang.
  type SemBucket = { sort: number; sem: string; year: number; sempro: number; kompre: number; wisudawan: number };
  const semMap = new Map<string, SemBucket>();
  const addSem = (dateStr: string | undefined, key: "sempro" | "kompre" | "wisudawan") => {
    const b = semesterBucket(dateStr);
    if (!b) return;
    const e = semMap.get(b.key) ?? { sort: b.sort, sem: b.sem, year: b.year, sempro: 0, kompre: 0, wisudawan: 0 };
    e[key] += 1;
    semMap.set(b.key, e);
  };
  for (const u of ujian) {
    if (u.jenis === "sempro") addSem(u.tanggal, "sempro");
    else if (u.jenis === "kompre") addSem(u.tanggal, "kompre");
  }
  const wisudawanRecs = (results[byKey("wisudawan")]?.data as Array<{ tanggal_sidang?: string }> | undefined) ?? [];
  for (const w of wisudawanRecs) addSem(w.tanggal_sidang, "wisudawan");

  const semData = [...semMap.values()].sort((a, b) => a.sort - b.sort).slice(-6);
  const semMax = Math.max(1, ...semData.flatMap((s) => [s.sempro, s.kompre, s.wisudawan]));
  const SEM_SERIES: { key: "sempro" | "wisudawan" | "kompre"; label: string; color: string }[] = [
    { key: "sempro", label: "Sempro", color: "var(--m-sempro)" },
    { key: "wisudawan", label: "Wisudawan", color: "var(--m-wisudawan)" },
    { key: "kompre", label: "Kompre", color: "var(--m-ujian)" },
  ];

  const upcoming = ujian
    .map((u) => ({ ...u, eff: effectiveStatus(u) }))
    .filter((u) => u.eff === "akan" || u.eff === "sedang")
    .sort((a, b) => (a.tanggal || "").localeCompare(b.tanggal || ""))
    .slice(0, 5);

  return (
    <AppLayout title="Dashboard" fluid>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Main column ── */}
        <div className="space-y-6">
          {/* Welcome banner */}
          <section className="card-hairline rise-in relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-accent/60 to-card p-6 md:p-8">
            <div className="pointer-events-none absolute -right-6 -top-8 opacity-[0.12]">
              <GraduationCap className="h-44 w-44 text-primary" />
            </div>
            <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative max-w-lg">
              <h1 className="font-display text-[1.9rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                Selamat datang, {me ? me.full_name.split(" ")[0] : "Admin"}! 👋
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Kelola seluruh data dan konten Program Studi PTIK dari satu tempat.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-xl border border-border bg-card/70 px-4 py-2.5 backdrop-blur-sm">
                  <div className="font-display text-2xl font-medium tabular-nums text-foreground">{total}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total data</div>
                </div>
                <div className="rounded-xl border border-border bg-card/70 px-4 py-2.5 backdrop-blur-sm">
                  <div className="font-display text-2xl font-medium tabular-nums text-foreground">{MODULES.length}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Modul aktif</div>
                </div>
                <div className="rounded-xl border border-border bg-card/70 px-4 py-2.5 backdrop-blur-sm">
                  <div className="font-display text-2xl font-medium tabular-nums text-foreground">{upcoming.length}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ujian terjadwal</div>
                </div>
              </div>
            </div>
          </section>

          {/* Ringkasan + Bar chart */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Ringkasan modul (progress list) */}
            <section className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Ringkasan Data</h2>
              </div>
              <div className="space-y-3.5">
                {CHART_KEYS.slice(0, 6).map((k) => {
                  const m = mod(k);
                  const c = countOf(k);
                  const pct = (c / chartMax) * 100;
                  return (
                    <button key={k} onClick={() => navigate(m.path)} style={accentStyle(k)} className="group flex w-full items-center gap-3">
                      <span className="w-24 shrink-0 truncate text-left text-sm text-muted-foreground group-hover:text-foreground">{m.label}</span>
                      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700" style={{ width: `${anyLoading ? 0 : pct}%`, background: "hsl(var(--ma))" }} />
                      </span>
                      <span className="w-8 shrink-0 text-right font-display text-sm tabular-nums text-foreground">{c}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Per-semester bar chart (Sempro / Wisudawan / Kompre) */}
            <section className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Statistik per Semester</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Sempro, Wisudawan &amp; Kompre tiap semester.</p>
              <div className="mb-3 mt-3 flex flex-wrap gap-3">
                {SEM_SERIES.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `hsl(${s.color})` }} /> {s.label}
                  </span>
                ))}
              </div>
              {semData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  {anyLoading ? "Memuat…" : "Belum ada data."}
                </div>
              ) : (
                <div className="flex h-40 items-end gap-3">
                  {semData.map((s) => (
                    <div key={`${s.year}-${s.sem}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end justify-center gap-1">
                        {SEM_SERIES.map((ser) => {
                          const c = s[ser.key];
                          const h = (c / semMax) * 100;
                          return (
                            <div
                              key={ser.key}
                              className="w-2.5 rounded-t transition-[height] duration-700"
                              style={{ height: `${anyLoading ? 0 : Math.max(h, 3)}%`, background: `hsl(${ser.color})` }}
                              title={`${ser.label} · ${s.sem} ${s.year}: ${c}`}
                            />
                          );
                        })}
                      </div>
                      <span className="w-full text-center text-[10px] leading-tight text-muted-foreground">
                        {s.sem}
                        <br />
                        {s.year}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Featured colorful module cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Modul Utama</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURED.map((k) => {
                const m = mod(k);
                return (
                  <button
                    key={k}
                    onClick={() => navigate(m.path)}
                    style={accentStyle(k)}
                    className="group relative overflow-hidden rounded-2xl p-5 text-left text-white shadow-soft transition-all hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--ma)), hsl(var(--ma)/0.75))" }} />
                    <div className="pointer-events-none absolute -right-4 -top-4 opacity-20">
                      <m.icon className="h-20 w-20" />
                    </div>
                    <div className="relative">
                      <m.icon className="h-6 w-6" />
                      <div className="mt-6 font-display text-3xl font-medium tabular-nums">{countOf(k)}</div>
                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="text-sm font-medium">{m.label}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right rail ── */}
        <aside className="space-y-6">
          {/* Profile */}
          <section className="card-hairline rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto">
              <InitialsAvatar name={me?.full_name ?? "?"} className="mx-auto h-16 w-16 text-lg" />
            </div>
            <div className="mt-3 font-display text-lg font-medium text-foreground">{me?.full_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{me?.email ?? ""}</div>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              {roleLabel(me?.role)}
            </span>
          </section>

          {/* Ringkasan levels */}
          <section className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-4 font-display text-base font-medium tracking-[-0.01em] text-foreground">Modul Teratas</h3>
            <div className="space-y-4">
              {FEATURED.map((k) => {
                const m = mod(k);
                const c = countOf(k);
                const pct = (c / chartMax) * 100;
                return (
                  <div key={k} style={accentStyle(k)}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))]"><m.icon className="h-3.5 w-3.5" /></span>
                        {m.label}
                      </span>
                      <span className="font-display tabular-nums text-muted-foreground">{c}</span>
                    </div>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full" style={{ width: `${anyLoading ? 0 : Math.max(pct, 4)}%`, background: "hsl(var(--ma))" }} />
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ujian terdekat (reminders) */}
          <section className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Ujian Terdekat</h3>
              <Link to="/kelola/ujian" className="text-xs font-medium text-primary hover:underline">Semua</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada ujian terjadwal.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((u) => (
                  <li key={u.id}>
                    <Link to="/kelola/ujian" className="group flex items-start gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${u.eff === "sedang" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"}`}>
                        {u.eff === "sedang" ? <Clock3 className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground group-hover:text-primary">{u.nama}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{jenisLabel(u.jenis)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {u.tanggal || "—"}</span>
                        </div>
                        <span className="text-[11px] font-medium text-primary/80">{statusLabel(u.eff)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}
