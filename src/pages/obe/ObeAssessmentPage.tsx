import { useEffect, useMemo, useState } from "react";
import { Plus, ClipboardCheck, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { AssessmentFormDialog } from "@/components/obe/AssessmentFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import {
  useCourses,
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useAssessmentMapping,
  useSetAssessmentMapping,
} from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { jenisAssessmentLabel, type Assessment, type AssessmentInput } from "@/lib/api/obeApi";

export default function ObeAssessmentPage() {
  const manage = useCanWrite("obe");
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

  const { data: rows = [], isLoading } = useAssessments(courseId);
  const createMut = useCreateAssessment();
  const updateMut = useUpdateAssessment();
  const deleteMut = useDeleteAssessment();

  const { data: mapping } = useAssessmentMapping(courseId);
  const setMapMut = useSetAssessmentMapping();
  const linked = useMemo(
    () => new Set((mapping?.links ?? []).map((l) => `${l.assessment_id}|${l.cpmk_id}`)),
    [mapping],
  );
  const cpmks = mapping?.cpmks ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Assessment | null>(null);

  // Bobot grouped per tahun akademik (validation scope = MK + TA).
  const bobotByTA = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of rows) m.set(a.tahun_akademik, (m.get(a.tahun_akademik) ?? 0) + a.bobot);
    return m;
  }, [rows]);
  const dialogUsedBobot = useMemo(() => {
    const ta = editing?.tahun_akademik ?? rows[0]?.tahun_akademik ?? "";
    return (bobotByTA.get(ta) ?? 0) - (editing?.bobot ?? 0);
  }, [bobotByTA, editing, rows]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (x: Assessment) => {
    setEditing(x);
    setDialogOpen(true);
  };
  const handleSubmit = (input: AssessmentInput) => {
    if (editing) updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    else createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
  };
  const handleDelete = (x: Assessment) => {
    if (window.confirm(`Hapus assessment "${x.nama}" beserta nilai mahasiswanya?`)) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Assessment" fluid>
      <ListHeader
        accentKey="obe"
        icon={ClipboardCheck}
        title="Assessment"
        description="Komponen penilaian per mata kuliah dan pemetaannya ke CPMK."
        count={rows.length}
        countLabel="Assessment"
      >
        {manage && (
          <Button onClick={openCreate} disabled={!courseId}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Assessment
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} />
          <div>
            <Label htmlFor="asm-course" className="mb-1.5 block">Mata Kuliah</Label>
            <NativeSelect id="asm-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={courses.length === 0}>
              {courses.length === 0 && <option value="">— belum ada mata kuliah —</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>Sem {c.semester} · {c.kode ? `${c.kode} — ` : ""}{c.nama}</option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Total bobot per tahun akademik */}
        {rows.length > 0 && (
          <div className="flex flex-wrap gap-3 border-b border-border px-4 py-3">
            {[...bobotByTA.entries()].map(([ta, total]) => (
              <span
                key={ta || "-"}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  total === 100 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {total === 100 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {ta || "Tanpa TA"}: total bobot {total}%{total !== 100 && " (harus 100%)"}
              </span>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !courseId ? (
          <EmptyState title="Pilih mata kuliah" description="Tambahkan mata kuliah di menu Kurikulum terlebih dahulu." />
        ) : rows.length === 0 ? (
          <EmptyState title="Belum ada assessment" description={manage ? "Klik Tambah Assessment untuk membuat yang pertama." : "Data akan tampil di sini."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-28">Jenis</TableHead>
                <TableHead className="w-20 text-center">Bobot</TableHead>
                <TableHead className="w-28">Semester</TableHead>
                <TableHead className="w-32">Tahun Akademik</TableHead>
                {manage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id} className="group">
                  <TableCell className="font-medium text-foreground">{x.nama}</TableCell>
                  <TableCell><Badge variant="secondary">{jenisAssessmentLabel(x.jenis)}</Badge></TableCell>
                  <TableCell className="text-center font-display tabular-nums text-foreground">{x.bobot}%</TableCell>
                  <TableCell className="text-muted-foreground">{x.semester || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{x.tahun_akademik || "—"}</TableCell>
                  {manage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(x)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(x)} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Matrix assessment ↔ CPMK */}
      {courseId && rows.length > 0 && (
        <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">Mapping Assessment → CPMK</h2>
            <p className="text-xs text-muted-foreground">Tandai CPMK mana yang diukur oleh tiap assessment.</p>
          </div>
          {cpmks.length === 0 ? (
            <EmptyState title="Belum ada CPMK" description="Tambahkan CPMK untuk mata kuliah ini terlebih dahulu di menu CPMK." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="sticky left-0 z-10 min-w-[180px] border-b border-r border-border bg-muted/40 p-3 text-left font-semibold text-foreground">
                      Assessment \ CPMK
                    </th>
                    {cpmks.map((m) => (
                      <th key={m.id} className="border-b border-border p-2 text-center font-semibold text-foreground" title={m.deskripsi}>
                        {m.kode || "CPMK"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/20">
                      <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-3">
                        <span className="font-medium text-foreground">{a.nama}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">({a.bobot}%)</span>
                      </td>
                      {cpmks.map((m) => {
                        const on = linked.has(`${a.id}|${m.id}`);
                        return (
                          <td key={m.id} className="border-b border-border p-2 text-center">
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={!manage || setMapMut.isPending}
                              onChange={() => setMapMut.mutate({ assessment_id: a.id, cpmk_id: m.id, linked: !on })}
                              className="h-4 w-4 cursor-pointer accent-[hsl(var(--ma))] disabled:cursor-not-allowed"
                              aria-label={`${a.nama} mengukur ${m.kode || "CPMK"}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {courseId && (
        <AssessmentFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          courseId={courseId}
          usedBobot={Math.max(0, dialogUsedBobot)}
          onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending}
        />
      )}
    </AppLayout>
  );
}
