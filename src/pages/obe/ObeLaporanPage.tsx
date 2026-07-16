import { useMemo, useState } from "react";
import { FileBarChart, Check, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useCourses, useCpl, useMapping } from "@/features/obe/hooks/useObe";
import { exportLaporanPdf, exportLaporanExcel } from "@/features/obe/exportLaporan";
import { accentStyle } from "@/lib/moduleColors";
import { kategoriLabel, TOTAL_SEMESTER } from "@/lib/api/obeApi";

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export default function ObeLaporanPage() {
  const { curriculums, curriculumId, setCurriculumId, selected } = useSelectedCurriculum();
  const { data: courses = [] } = useCourses(curriculumId);
  const { data: cpls = [] } = useCpl(curriculumId);
  const { data: mapping } = useMapping(curriculumId);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const cpmks = mapping?.cpmks ?? [];
  const linked = useMemo(() => new Set((mapping?.links ?? []).map((l) => `${l.cpl_id}|${l.cpmk_id}`)), [mapping]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const cpmkByCourse = useMemo(() => {
    const m = new Map<string, typeof cpmks>();
    for (const c of cpmks) m.set(c.course_id, [...(m.get(c.course_id) ?? []), c]);
    return m;
  }, [cpmks]);
  const totalSks = courses.reduce((a, c) => a + c.sks, 0);

  const hasData = courses.length > 0 || cpls.length > 0 || cpmks.length > 0;

  const doExport = async (kind: "pdf" | "excel") => {
    if (exporting) return;
    setExporting(kind);
    try {
      const payload = { curriculum: selected, courses, cpls, cpmks, links: mapping?.links ?? [] };
      if (kind === "pdf") await exportLaporanPdf(payload);
      else await exportLaporanExcel(payload);
      toast.success(kind === "pdf" ? "Laporan PDF diunduh" : "Laporan Excel diunduh");
    } catch (e) {
      toast.error((e as Error).message || "Gagal membuat berkas ekspor");
    } finally {
      setExporting(null);
    }
  };

  return (
    <AppLayout title="Laporan OBE" fluid>
      <ListHeader
        accentKey="obe"
        icon={FileBarChart}
        title="Laporan OBE"
        description="Ringkasan struktur kurikulum, CPL, CPMK, dan pemetaannya."
        count={courses.length}
        countLabel="Mata Kuliah"
      >
        <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} label="" className="w-full sm:w-64" />
      </ListHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={!hasData || exporting !== null} onClick={() => doExport("pdf")}>
          <FileText className="mr-1.5 h-4 w-4" /> {exporting === "pdf" ? "Membuat PDF…" : "Export PDF"}
        </Button>
        <Button variant="outline" disabled={!hasData || exporting !== null} onClick={() => doExport("excel")}>
          <FileSpreadsheet className="mr-1.5 h-4 w-4" /> {exporting === "excel" ? "Membuat Excel…" : "Export Excel"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Berisi struktur kurikulum, CPL, CPMK, dan matriks pemetaan untuk kurikulum terpilih.
        </span>
      </div>

      {/* Struktur Kurikulum */}
      <ReportSection title={`Struktur Kurikulum · Total ${totalSks} SKS`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Semester</TableHead>
              <TableHead className="w-28">Kode</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead className="w-16 text-center">SKS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: TOTAL_SEMESTER }, (_, i) => i + 1).flatMap((n) => {
              const rows = courses.filter((c) => c.semester === n);
              if (rows.length === 0) return [];
              const sks = rows.reduce((a, c) => a + c.sks, 0);
              return rows.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{idx === 0 ? `Semester ${n}` : ""}</TableCell>
                  <TableCell className="font-medium text-foreground">{c.kode || "—"}</TableCell>
                  <TableCell className="text-foreground">{c.nama}{idx === rows.length - 1 && <span className="ml-2 text-xs text-muted-foreground">({sks} SKS)</span>}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{c.sks}</TableCell>
                </TableRow>
              ));
            })}
            {courses.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Belum ada mata kuliah.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ReportSection>

      {/* Laporan CPL */}
      <ReportSection title={`Laporan CPL · ${cpls.length} capaian`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Kode</TableHead>
              <TableHead className="w-44">Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cpls.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">{c.kode || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{kategoriLabel(c.kategori)}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{c.deskripsi}</TableCell>
              </TableRow>
            ))}
            {cpls.length === 0 && (
              <TableRow><TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">Belum ada CPL.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ReportSection>

      {/* Laporan CPMK (grouped by course) */}
      <ReportSection title={`Laporan CPMK · ${cpmks.length} capaian`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-56">Mata Kuliah</TableHead>
              <TableHead className="w-28">Kode</TableHead>
              <TableHead className="w-20">Bloom</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...cpmkByCourse.entries()].flatMap(([courseId, list]) =>
              list.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="text-foreground">{idx === 0 ? courseById.get(courseId)?.nama ?? "—" : ""}</TableCell>
                  <TableCell className="font-medium text-foreground">{c.kode || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.level_bloom || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.deskripsi}</TableCell>
                </TableRow>
              )),
            )}
            {cpmks.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Belum ada CPMK.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ReportSection>

      {/* Mapping matrix (read-only) */}
      <ReportSection title="Matriks Pemetaan CPL – CPMK">
        {cpls.length === 0 || cpmks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Perlu minimal satu CPL dan satu CPMK.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 min-w-[200px] border-b border-r border-border bg-muted/40 p-3 text-left font-semibold text-foreground">CPMK \ CPL</th>
                {cpls.map((c) => (
                  <th key={c.id} className="border-b border-border p-2 text-center font-semibold text-foreground" title={c.deskripsi}>{c.kode || "CPL"}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cpmks.map((m) => (
                <tr key={m.id}>
                  <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-3 text-left font-medium text-foreground" title={m.deskripsi}>{m.kode || "CPMK"}</td>
                  {cpls.map((c) => (
                    <td key={c.id} className="border-b border-border p-2 text-center">
                      {linked.has(`${c.id}|${m.id}`) ? <Check className="mx-auto h-4 w-4 text-[hsl(var(--ma))]" /> : <span className="text-muted-foreground/30">·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ReportSection>
    </AppLayout>
  );
}
