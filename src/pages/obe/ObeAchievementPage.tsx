import { useEffect, useMemo, useState } from "react";
import { TrendingUp, FileText, FileSpreadsheet, AlertTriangle, type LucideIcon, ListChecks, Target, Crosshair } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useCourses, useClasses, useClassResults, useScoreMatrix } from "@/features/obe/hooks/useObe";
import { exportAchievementPdf, exportAchievementExcel } from "@/features/obe/exportAchievement";
import { accentStyle } from "@/lib/moduleColors";
import type { AggRow, ResultRow } from "@/lib/api/obeApi";

// Class-level attainment bars for one dimension (CPMK/CPL/IK).
function AggBars({
  icon: Icon,
  title,
  rows,
  labelOf,
  threshold,
}: {
  icon: LucideIcon;
  title: string;
  rows: AggRow[];
  labelOf: (refId: string) => string;
  threshold: number;
}) {
  return (
    <section style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data terhitung.</p>
      ) : (
        <div className="space-y-3.5">
          {rows.map((r) => {
            const ok = r.nilai >= threshold;
            return (
              <div key={r.ref_id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{labelOf(r.ref_id)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.tercapai}/{r.dinilai} tercapai</span>
                    <span className={`font-display tabular-nums ${ok ? "text-emerald-600" : "text-amber-600"}`}>{r.nilai}%</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${Math.min(r.nilai, 100)}%`, background: ok ? "hsl(152 60% 42%)" : "hsl(var(--ma))" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// Per-student recap table for one dimension.
function RecapTable({
  title,
  refs,
  students,
  dim,
}: {
  title: string;
  refs: { id: string; kode: string }[];
  students: { student: { id: string; npm: string; nama: string }; rows: ResultRow[] }[];
  dim: string;
}) {
  if (refs.length === 0) return null;
  return (
    <section style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Mahasiswa</TableHead>
              {refs.map((r) => (
                <TableHead key={r.id} className="text-center">{r.kode || dim}</TableHead>
              ))}
              <TableHead className="text-center">Rata-rata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(({ student, rows }) => {
              const byRef = new Map(rows.map((r) => [r.ref_id, r]));
              const present = rows.map((r) => r.nilai);
              const avg = present.length ? Math.round((present.reduce((a, b) => a + b, 0) / present.length) * 100) / 100 : null;
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{student.nama}</div>
                    <div className="text-xs text-muted-foreground">{student.npm || "—"}</div>
                  </TableCell>
                  {refs.map((r) => {
                    const cell = byRef.get(r.id);
                    return (
                      <TableCell key={r.id} className="text-center">
                        {cell ? (
                          <span className={`font-display tabular-nums ${cell.status === "tercapai" ? "text-emerald-600" : "text-amber-600"}`}>
                            {cell.nilai}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-display font-medium tabular-nums text-foreground">
                    {avg ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export default function ObeAchievementPage() {
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data: courses = [] } = useCourses(curriculumId);
  const [courseId, setCourseId] = useState("");
  // Default to the first item, but never stomp a still-valid user selection.
  useEffect(() => {
    if (courses.length === 0) {
      if (courseId) setCourseId("");
      return;
    }
    if (!courses.some((c) => c.id === courseId)) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const { data: classes = [] } = useClasses({ courseId });
  const [classId, setClassId] = useState("");
  useEffect(() => {
    if (classes.length === 0) {
      if (classId) setClassId("");
      return;
    }
    if (!classes.some((c) => c.id === classId)) setClassId(classes[0].id);
  }, [classes, classId]);

  const { data: results, isLoading } = useClassResults(classId);
  const { data: matrix } = useScoreMatrix(classId);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const kode = useMemo(() => {
    const m = new Map<string, string>();
    for (const x of results?.cpmks ?? []) m.set(x.id, x.kode || "CPMK");
    for (const x of results?.cpls ?? []) m.set(x.id, x.kode || "CPL");
    for (const x of results?.iks ?? []) m.set(x.id, x.kode || "IK");
    return (refId: string) => m.get(refId) ?? refId;
  }, [results]);

  const hasResults = !!results && results.students.some((s) => s.cpmk.length > 0);

  const doExport = async (kind: "pdf" | "excel") => {
    if (!results || !matrix || exporting) return;
    setExporting(kind);
    try {
      const payload = { results, matrix };
      if (kind === "pdf") await exportAchievementPdf(payload);
      else await exportAchievementExcel(payload);
      toast.success(kind === "pdf" ? "Rekap PDF diunduh" : "Rekap Excel diunduh");
    } catch (e) {
      toast.error((e as Error).message || "Gagal membuat berkas ekspor");
    } finally {
      setExporting(null);
    }
  };

  return (
    <AppLayout title="Achievement OBE" fluid>
      <ListHeader
        accentKey="obe"
        icon={TrendingUp}
        title="Achievement OBE"
        description="Ketercapaian CPMK, CPL, dan IK dihitung otomatis dari nilai mahasiswa."
        count={results?.students.length ?? 0}
        countLabel="Mahasiswa"
      >
        <div className="flex gap-2">
          <Button variant="outline" disabled={!hasResults || !matrix || exporting !== null} onClick={() => doExport("pdf")}>
            <FileText className="mr-1.5 h-4 w-4" /> {exporting === "pdf" ? "Membuat…" : "Export PDF"}
          </Button>
          <Button variant="outline" disabled={!hasResults || !matrix || exporting !== null} onClick={() => doExport("excel")}>
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> {exporting === "excel" ? "Membuat…" : "Export Excel"}
          </Button>
        </div>
      </ListHeader>

      {/* Pemilih konteks */}
      <div style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-3">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} />
          <div>
            <Label htmlFor="ach-course" className="mb-1.5 block">Mata Kuliah</Label>
            <NativeSelect id="ach-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={courses.length === 0}>
              {courses.length === 0 && <option value="">— belum ada mata kuliah —</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>Sem {c.semester} · {c.kode ? `${c.kode} — ` : ""}{c.nama}</option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="ach-class" className="mb-1.5 block">Kelas</Label>
            <NativeSelect id="ach-class" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={classes.length === 0}>
              {classes.length === 0 && <option value="">— belum ada kelas —</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Kelas {c.nama}{c.tahun_akademik ? ` · ${c.tahun_akademik}` : ""}</option>
              ))}
            </NativeSelect>
          </div>
        </div>
        {results && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">Threshold {results.threshold}%</Badge>
            <Badge variant="secondary">Dosen: {results.class.dosen_nama || "—"}</Badge>
            {results.bobot_total !== 100 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Total bobot assessment {results.bobot_total}% — hasil belum final.
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !classId ? (
        <div className="card-hairline rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState title="Pilih kelas" description="Achievement dihitung per kelas. Buat kelas & input nilai terlebih dahulu di menu Kelas & Nilai." />
        </div>
      ) : !hasResults ? (
        <div className="card-hairline rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState
            title="Belum ada hasil terhitung"
            description="Pastikan: assessment sudah dipetakan ke CPMK (menu Assessment), dan nilai mahasiswa sudah diinput (menu Kelas & Nilai)."
          />
        </div>
      ) : (
        <>
          {/* Bar ketercapaian level kelas */}
          <div className="grid gap-6 lg:grid-cols-3">
            <AggBars icon={ListChecks} title="CPMK Achievement" rows={results.class_cpmk} labelOf={kode} threshold={results.threshold} />
            <AggBars icon={Target} title="CPL Achievement" rows={results.class_cpl} labelOf={kode} threshold={results.threshold} />
            <AggBars icon={Crosshair} title="IK Achievement" rows={results.class_ik} labelOf={kode} threshold={results.threshold} />
          </div>

          {/* Rekap per mahasiswa */}
          <RecapTable
            title="Rekap CPMK per Mahasiswa (%)"
            refs={results.cpmks}
            students={results.students.map((s) => ({ student: s.student, rows: s.cpmk }))}
            dim="CPMK"
          />
          <RecapTable
            title="Rekap CPL per Mahasiswa (%)"
            refs={results.cpls}
            students={results.students.map((s) => ({ student: s.student, rows: s.cpl }))}
            dim="CPL"
          />
          <RecapTable
            title="Rekap IK per Mahasiswa (%)"
            refs={results.iks}
            students={results.students.map((s) => ({ student: s.student, rows: s.ik }))}
            dim="IK"
          />
        </>
      )}
    </AppLayout>
  );
}
