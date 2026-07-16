import { useEffect, useMemo, useState } from "react";
import { Plus, Users, Pencil, Trash2, Save, UserPlus, AlertTriangle } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { ClassFormDialog } from "@/components/obe/ClassFormDialog";
import { StudentFormDialog } from "@/components/obe/StudentFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import {
  useCourses,
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useCreateClassStudent,
  useCreateClassStudentsBulk,
  useUpdateClassStudent,
  useDeleteClassStudent,
  useScoreMatrix,
  useSaveScores,
} from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import type { Class, ClassInput, ClassStudent, ClassStudentInput, ScoreCell } from "@/lib/api/obeApi";

export default function ObeNilaiPage() {
  const manageObe = useCanWrite("obe"); // kelola kelas (admin / grant obe)
  const manageNilai = useCanWrite("obe-nilai"); // roster + input nilai (admin / grant obe-nilai)

  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data: courses = [] } = useCourses(curriculumId);
  const [courseId, setCourseId] = useState("");
  // Default to the first item, but never stomp a still-valid user selection
  // (any obe mutation refetches these lists and would otherwise reset pickers).
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

  const createClassMut = useCreateClass();
  const updateClassMut = useUpdateClass();
  const deleteClassMut = useDeleteClass();
  const [classDialog, setClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const createStuMut = useCreateClassStudent();
  const bulkStuMut = useCreateClassStudentsBulk();
  const updateStuMut = useUpdateClassStudent();
  const deleteStuMut = useDeleteClassStudent();
  const [stuDialog, setStuDialog] = useState(false);
  const [editingStu, setEditingStu] = useState<ClassStudent | null>(null);

  const { data: matrix, isLoading } = useScoreMatrix(classId);
  const saveMut = useSaveScores();

  // Grid edits: key "studentId|assessmentId" → string input value.
  const [edits, setEdits] = useState<Record<string, string>>({});
  useEffect(() => setEdits({}), [classId]);

  const existing = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of matrix?.scores ?? []) m.set(`${s.student_id}|${s.assessment_id}`, s.score);
    return m;
  }, [matrix]);

  const cellValue = (studentId: string, assessmentId: string) => {
    const key = `${studentId}|${assessmentId}`;
    if (key in edits) return edits[key];
    const v = existing.get(key);
    return v === undefined ? "" : String(v);
  };
  const dirtyCount = useMemo(
    () =>
      Object.entries(edits).filter(([key, val]) => {
        const prev = existing.get(key);
        if (val === "") return false; // pengosongan tidak dikirim (tidak ada delete nilai)
        return prev === undefined || String(prev) !== val;
      }).length,
    [edits, existing],
  );

  const handleSave = () => {
    if (!matrix) return;
    const cells: ScoreCell[] = [];
    for (const st of matrix.students) {
      for (const a of matrix.assessments) {
        const key = `${st.id}|${a.id}`;
        const raw = key in edits ? edits[key] : undefined;
        if (raw === undefined || raw === "") continue;
        const num = Number(raw);
        if (Number.isNaN(num)) continue;
        cells.push({ student_id: st.id, assessment_id: a.id, score: num });
      }
    }
    if (cells.length === 0) return;
    saveMut.mutate({ classId, scores: cells }, { onSuccess: () => setEdits({}) });
  };

  const submitClass = (input: ClassInput) => {
    if (editingClass) updateClassMut.mutate({ id: editingClass.id, input }, { onSuccess: () => setClassDialog(false) });
    else createClassMut.mutate(input, { onSuccess: () => setClassDialog(false) });
  };
  const removeClass = (c: Class) => {
    if (window.confirm(`Hapus kelas "${c.nama}" beserta roster dan seluruh nilainya?`)) {
      deleteClassMut.mutate(c.id);
    }
  };
  const submitStudent = (input: ClassStudentInput) => {
    if (editingStu) updateStuMut.mutate({ id: editingStu.id, input }, { onSuccess: () => setStuDialog(false) });
    else createStuMut.mutate(input, { onSuccess: () => setStuDialog(false) });
  };
  const submitStudentsBulk = (students: { npm: string; nama: string }[]) => {
    bulkStuMut.mutate({ classId, students }, { onSuccess: () => setStuDialog(false) });
  };
  const removeStudent = (s: ClassStudent) => {
    if (window.confirm(`Hapus "${s.nama}" dari roster (nilai ikut terhapus)?`)) deleteStuMut.mutate(s.id);
  };

  const selectedClass = classes.find((c) => c.id === classId) ?? null;
  const students = matrix?.students ?? [];
  const assessments = matrix?.assessments ?? [];

  return (
    <AppLayout title="Kelas & Nilai" fluid>
      <ListHeader
        accentKey="obe"
        icon={Users}
        title="Kelas & Input Nilai"
        description="Kelola kelas, roster mahasiswa, dan nilai per assessment."
        count={students.length}
        countLabel="Mahasiswa"
      >
        {manageNilai && classId && (
          <Button onClick={handleSave} disabled={dirtyCount === 0 || saveMut.isPending}>
            <Save className="mr-1.5 h-4 w-4" />
            {saveMut.isPending ? "Menyimpan…" : dirtyCount > 0 ? `Simpan ${dirtyCount} Nilai` : "Simpan Nilai"}
          </Button>
        )}
      </ListHeader>

      {/* Pemilih konteks */}
      <div style={accentStyle("obe")} className="card-hairline rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-3">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} />
          <div>
            <Label htmlFor="nilai-course" className="mb-1.5 block">Mata Kuliah</Label>
            <NativeSelect id="nilai-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={courses.length === 0}>
              {courses.length === 0 && <option value="">— belum ada mata kuliah —</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>Sem {c.semester} · {c.kode ? `${c.kode} — ` : ""}{c.nama}</option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="nilai-class" className="mb-1.5 block">Kelas</Label>
            <div className="flex gap-2">
              <NativeSelect id="nilai-class" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={classes.length === 0} className="flex-1">
                {classes.length === 0 && <option value="">— belum ada kelas —</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama}{c.tahun_akademik ? ` · ${c.tahun_akademik}` : ""}{c.dosen_nama ? ` · ${c.dosen_nama}` : ""}
                  </option>
                ))}
              </NativeSelect>
              {manageObe && (
                <>
                  <Button variant="outline" size="icon" title="Tambah kelas" disabled={!courseId} onClick={() => { setEditingClass(null); setClassDialog(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  {selectedClass && (
                    <>
                      <Button variant="outline" size="icon" title="Edit kelas" onClick={() => { setEditingClass(selectedClass); setClassDialog(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="Hapus kelas" onClick={() => removeClass(selectedClass)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid nilai */}
      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div>
            <h2 className="font-display text-base font-medium tracking-[-0.01em] text-foreground">
              {selectedClass ? `Nilai — Kelas ${selectedClass.nama}` : "Nilai"}
            </h2>
            {matrix && matrix.bobot_total !== 100 && assessments.length > 0 && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Total bobot assessment {matrix.bobot_total}% (idealnya 100%).
              </p>
            )}
          </div>
          {manageNilai && classId && (
            <Button variant="outline" size="sm" onClick={() => { setEditingStu(null); setStuDialog(true); }}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Tambah Mahasiswa
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !classId ? (
          <EmptyState title="Pilih atau buat kelas" description="Nilai diinput per kelas. Buat kelas terlebih dahulu." />
        ) : students.length === 0 ? (
          <EmptyState title="Roster masih kosong" description={manageNilai ? "Klik Tambah Mahasiswa — bisa tempel daftar sekaligus (bulk)." : "Mahasiswa akan tampil di sini."} />
        ) : assessments.length === 0 ? (
          <EmptyState title="Belum ada assessment" description="Tambahkan assessment untuk mata kuliah ini di menu Assessment." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 min-w-[220px] border-b border-r border-border bg-muted/40 p-3 text-left font-semibold text-foreground">Mahasiswa</th>
                  {assessments.map((a) => (
                    <th key={a.id} className="min-w-[90px] border-b border-border p-2 text-center font-semibold text-foreground">
                      {a.nama}
                      <span className="block text-[10px] font-normal text-muted-foreground">{a.bobot}%</span>
                    </th>
                  ))}
                  {manageNilai && <th className="w-20 border-b border-border p-2" />}
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/20">
                    <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-3">
                      <div className="font-medium text-foreground">{st.nama}</div>
                      <div className="text-xs text-muted-foreground">{st.npm || "—"}</div>
                    </td>
                    {assessments.map((a) => (
                      <td key={a.id} className="border-b border-border p-1.5 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!manageNilai}
                          value={cellValue(st.id, a.id)}
                          onChange={(e) => setEdits((m) => ({ ...m, [`${st.id}|${a.id}`]: e.target.value }))}
                          className="h-9 w-20 text-center tabular-nums"
                          aria-label={`Nilai ${st.nama} — ${a.nama}`}
                        />
                      </td>
                    ))}
                    {manageNilai && (
                      <td className="border-b border-border p-1.5 text-center">
                        <div className="flex justify-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit mahasiswa" onClick={() => { setEditingStu(st); setStuDialog(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Hapus" onClick={() => removeStudent(st)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {courseId && (
        <ClassFormDialog
          open={classDialog}
          onOpenChange={setClassDialog}
          initial={editingClass}
          courseId={courseId}
          onSubmit={submitClass}
          isPending={createClassMut.isPending || updateClassMut.isPending}
        />
      )}
      {classId && (
        <StudentFormDialog
          open={stuDialog}
          onOpenChange={setStuDialog}
          initial={editingStu}
          classId={classId}
          onSubmit={submitStudent}
          onSubmitBulk={submitStudentsBulk}
          isPending={createStuMut.isPending || bulkStuMut.isPending || updateStuMut.isPending}
        />
      )}
    </AppLayout>
  );
}
