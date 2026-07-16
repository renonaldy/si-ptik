import { useMemo, useState } from "react";
import { Plus, BookMarked, BookOpen, Pencil, Trash2, CheckCircle2, Circle, FileDown } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { CurriculumFormDialog } from "@/components/obe/CurriculumFormDialog";
import { CourseFormDialog } from "@/components/obe/CourseFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import {
  useCourses,
  useCreateCurriculum,
  useUpdateCurriculum,
  useDeleteCurriculum,
  useActivateCurriculum,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { TOTAL_SEMESTER, type Course, type CourseInput, type Curriculum, type CurriculumInput } from "@/lib/api/obeApi";

export default function ObeKurikulumPage() {
  const manage = useCanWrite("obe");
  const { curriculums, curriculumId, setCurriculumId, isLoading } = useSelectedCurriculum();

  // Curriculum CRUD
  const createCur = useCreateCurriculum();
  const updateCur = useUpdateCurriculum();
  const deleteCur = useDeleteCurriculum();
  const activateCur = useActivateCurriculum();
  const [curDialog, setCurDialog] = useState(false);
  const [editingCur, setEditingCur] = useState<Curriculum | null>(null);

  const submitCur = (input: CurriculumInput) => {
    if (editingCur) updateCur.mutate({ id: editingCur.id, input }, { onSuccess: () => setCurDialog(false) });
    else createCur.mutate(input, { onSuccess: () => setCurDialog(false) });
  };
  const removeCur = (c: Curriculum) => {
    if (window.confirm(`Hapus kurikulum "${c.nama}" beserta seluruh MK, CPL, CPMK, dan RPS-nya?`)) deleteCur.mutate(c.id);
  };

  // Courses (struktur) for the selected curriculum
  const { data: courses = [] } = useCourses(curriculumId);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const [sem, setSem] = useState(1);
  const [courseDialog, setCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const countBySem = useMemo(() => {
    const m: Record<number, number> = {};
    for (const c of courses) m[c.semester] = (m[c.semester] ?? 0) + 1;
    return m;
  }, [courses]);
  const semCourses = useMemo(() => courses.filter((c) => c.semester === sem), [courses, sem]);
  const semSks = semCourses.reduce((a, c) => a + c.sks, 0);

  const submitCourse = (input: CourseInput) => {
    if (editingCourse) updateCourse.mutate({ id: editingCourse.id, input }, { onSuccess: () => setCourseDialog(false) });
    else createCourse.mutate(input, { onSuccess: () => setCourseDialog(false) });
  };
  const removeCourse = (c: Course) => {
    if (window.confirm(`Hapus mata kuliah "${c.nama}"?`)) deleteCourse.mutate(c.id);
  };

  return (
    <AppLayout title="Kurikulum OBE">
      <ListHeader
        accentKey="obe"
        icon={BookMarked}
        title="Kurikulum"
        description="Kelola versi kurikulum OBE dan struktur mata kuliahnya."
        count={curriculums.length}
        countLabel="Kurikulum"
      >
        {manage && (
          <Button onClick={() => { setEditingCur(null); setCurDialog(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Kurikulum
          </Button>
        )}
      </ListHeader>

      {/* ── Curriculum list ── */}
      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : curriculums.length === 0 ? (
          <EmptyState icon={BookMarked} title="Belum ada kurikulum" description={manage ? "Klik Tambah Kurikulum untuk membuat yang pertama." : "Data akan tampil di sini."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-20">Tahun</TableHead>
                  <TableHead>Nomor SK</TableHead>
                  <TableHead className="w-28">Berlaku</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Dokumen</TableHead>
                  {manage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {curriculums.map((c) => (
                  <TableRow key={c.id} className="group">
                    <TableCell className="font-medium text-foreground">{c.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{c.tahun || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.nomor_sk || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.tanggal_berlaku || "—"}</TableCell>
                    <TableCell>
                      {c.is_active ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Aktif</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nonaktif</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 text-muted-foreground">
                        {c.buku_url && <a href={c.buku_url} target="_blank" rel="noreferrer" title="Buku Kurikulum" className="hover:text-primary"><FileDown className="h-4 w-4" /></a>}
                        {c.struktur_url && <a href={c.struktur_url} target="_blank" rel="noreferrer" title="Struktur Kurikulum" className="hover:text-primary"><FileDown className="h-4 w-4" /></a>}
                        {!c.buku_url && !c.struktur_url && "—"}
                      </div>
                    </TableCell>
                    {manage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={c.is_active ? "Kurikulum aktif" : "Aktifkan"} disabled={c.is_active || activateCur.isPending} onClick={() => activateCur.mutate(c.id)}>
                            {c.is_active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCur(c); setCurDialog(true); }} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCur(c)} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Struktur Mata Kuliah ── */}
      {curriculums.length > 0 && (
        <div style={accentStyle("obe")} className="card-hairline space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--ma)/0.12)] text-[hsl(var(--ma))]"><BookOpen className="h-5 w-5" /></div>
              <div>
                <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">Struktur Mata Kuliah</h2>
                <p className="text-sm text-muted-foreground">Mata kuliah per semester untuk kurikulum terpilih.</p>
              </div>
            </div>
            <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} label="" className="w-full sm:w-72" />
          </div>

          {/* Semester tabs */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: TOTAL_SEMESTER }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setSem(n)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  sem === n ? "border-[hsl(var(--ma))] bg-[hsl(var(--ma)/0.1)] text-[hsl(var(--ma))]" : "border-border text-muted-foreground hover:border-[hsl(var(--ma)/0.4)] hover:text-foreground"
                }`}
              >
                Sem {n}
                <span className={`rounded-full px-1.5 text-[11px] ${sem === n ? "bg-[hsl(var(--ma)/0.2)]" : "bg-muted"}`}>{countBySem[n] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
              <span className="text-sm font-medium text-foreground">Semester {sem}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Total {semSks} SKS · {semCourses.length} MK</span>
                {manage && (
                  <Button size="sm" variant="outline" disabled={!curriculumId} onClick={() => { setEditingCourse(null); setCourseDialog(true); }}>
                    <Plus className="mr-1 h-4 w-4" /> Tambah MK
                  </Button>
                )}
              </div>
            </div>
            {semCourses.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">Belum ada mata kuliah di semester ini.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Kode</TableHead>
                    <TableHead>Nama Mata Kuliah</TableHead>
                    <TableHead className="w-16 text-center">SKS</TableHead>
                    {manage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semCourses.map((c) => (
                    <TableRow key={c.id} className="group">
                      <TableCell className="font-medium text-foreground">{c.kode || "—"}</TableCell>
                      <TableCell className="text-foreground">{c.nama}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{c.sks}</TableCell>
                      {manage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCourse(c); setCourseDialog(true); }} title="Edit"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCourse(c)} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      <CurriculumFormDialog
        open={curDialog}
        onOpenChange={setCurDialog}
        initial={editingCur}
        onSubmit={submitCur}
        isPending={createCur.isPending || updateCur.isPending}
      />
      {curriculumId && (
        <CourseFormDialog
          open={courseDialog}
          onOpenChange={setCourseDialog}
          initial={editingCourse}
          curriculumId={curriculumId}
          defaultSemester={sem}
          onSubmit={submitCourse}
          isPending={createCourse.isPending || updateCourse.isPending}
        />
      )}
    </AppLayout>
  );
}
