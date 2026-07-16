import { Link } from "react-router-dom";
import { BookOpen, Target, ListChecks, ClipboardList, Sigma, Network, GraduationCap, ArrowRight } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useObeStats } from "@/features/obe/hooks/useObe";
import { accentStyle } from "@/lib/moduleColors";
import { CPL_KATEGORI, TOTAL_SEMESTER } from "@/lib/api/obeApi";

export default function ObeDashboardPage() {
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data: stats, isLoading } = useObeStats(curriculumId || undefined);

  const cur = stats?.curriculum ?? null;
  const semMax = Math.max(1, ...Array.from({ length: TOTAL_SEMESTER }, (_, i) => stats?.courses_by_semester?.[String(i + 1)] ?? 0));
  const katMax = Math.max(1, ...CPL_KATEGORI.map((k) => stats?.cpl_by_kategori?.[k.value] ?? 0));

  return (
    <AppLayout title="Dashboard OBE" fluid>
      {/* Header banner */}
      <section style={accentStyle("obe")} className="card-hairline rise-in relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[hsl(var(--ma)/0.14)] via-card to-card p-6 md:p-7">
        <div className="pointer-events-none absolute -right-8 -top-10 opacity-[0.12]"><GraduationCap className="h-40 w-40 text-[hsl(var(--ma))]" /></div>
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Dashboard Kurikulum OBE</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {cur ? (
                <>Kurikulum aktif: <span className="font-medium text-foreground">{cur.nama}</span>{cur.tahun ? ` · ${cur.tahun}` : ""}{cur.nomor_sk ? ` · SK ${cur.nomor_sk}` : ""}</>
              ) : (
                "Ringkasan capaian pembelajaran & struktur kurikulum."
              )}
            </p>
          </div>
          {curriculums.length > 0 && (
            <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} label="" className="w-full lg:w-72" />
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !cur ? (
        <div className="card-hairline rounded-2xl border border-border bg-card p-4 shadow-soft">
          <EmptyState
            icon={GraduationCap}
            title="Belum ada kurikulum aktif"
            description="Buat kurikulum dan aktifkan salah satunya untuk melihat ringkasan OBE."
          />
          <div className="flex justify-center pb-4">
            <Link to="/kelola/obe/kurikulum" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Ke menu Kurikulum <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Mata Kuliah" value={stats!.course_count} icon={BookOpen} accentKey="obe" />
            <StatCard label="Total SKS" value={stats!.total_sks} icon={Sigma} accentKey="obe" />
            <StatCard label="CPL" value={stats!.cpl_count} icon={Target} accentKey="obe" />
            <StatCard label="CPMK" value={stats!.cpmk_count} icon={ListChecks} accentKey="obe" />
            <StatCard label="RPS (baris)" value={stats!.rps_count} icon={ClipboardList} accentKey="obe" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mapping progress */}
            <section style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))]"><Network className="h-[18px] w-[18px]" /></div>
                <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Progress Pemetaan CPL–CPMK</h2>
              </div>
              <div className="flex items-end justify-between">
                <div className="font-display text-4xl font-medium tabular-nums text-foreground">{stats!.mapping_progress}%</div>
                <div className="text-right text-sm text-muted-foreground">{stats!.mapped_cpmk} dari {stats!.cpmk_count} CPMK<br />sudah dipetakan ke CPL</div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${stats!.mapping_progress}%`, background: "hsl(var(--ma))" }} />
              </div>
              <Link to="/kelola/obe/mapping" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Kelola pemetaan <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            {/* CPL by kategori */}
            <section style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="mb-4 font-display text-base font-medium tracking-[-0.01em] text-foreground">CPL per Kategori</h2>
              <div className="space-y-3">
                {CPL_KATEGORI.map((k) => {
                  const c = stats!.cpl_by_kategori?.[k.value] ?? 0;
                  return (
                    <div key={k.value} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-sm text-muted-foreground">{k.label}</span>
                      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700" style={{ width: `${(c / katMax) * 100}%`, background: "hsl(var(--ma))" }} />
                      </span>
                      <span className="w-6 shrink-0 text-right font-display text-sm tabular-nums text-foreground">{c}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Courses by semester */}
          <section style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-1 font-display text-base font-medium tracking-[-0.01em] text-foreground">Sebaran Mata Kuliah per Semester</h2>
            <p className="mb-4 text-xs text-muted-foreground">Jumlah mata kuliah di tiap semester kurikulum aktif.</p>
            <div className="flex h-44 items-end gap-3">
              {Array.from({ length: TOTAL_SEMESTER }, (_, i) => i + 1).map((n) => {
                const c = stats!.courses_by_semester?.[String(n)] ?? 0;
                return (
                  <div key={n} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="font-display text-sm tabular-nums text-muted-foreground">{c}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div className="w-full rounded-t transition-[height] duration-700" style={{ height: `${Math.max((c / semMax) * 100, c > 0 ? 6 : 2)}%`, background: "hsl(var(--ma))" }} title={`Semester ${n}: ${c} MK`} />
                    </div>
                    <span className="text-[11px] text-muted-foreground">Sem {n}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}
