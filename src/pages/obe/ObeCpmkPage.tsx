import { useEffect, useState } from "react";
import { Plus, ListChecks, Pencil, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { CpmkFormDialog } from "@/components/obe/CpmkFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useCourses, useCpmk, useCreateCpmk, useUpdateCpmk, useDeleteCpmk } from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import type { CPMK, CPMKInput } from "@/lib/api/obeApi";

export default function ObeCpmkPage() {
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

  const { data: rows = [], isLoading } = useCpmk({ courseId });
  const createMut = useCreateCpmk();
  const updateMut = useUpdateCpmk();
  const deleteMut = useDeleteCpmk();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CPMK | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (x: CPMK) => {
    setEditing(x);
    setDialogOpen(true);
  };
  const handleSubmit = (input: CPMKInput) => {
    if (editing) updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    else createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
  };
  const handleDelete = (x: CPMK) => {
    if (window.confirm(`Hapus CPMK "${x.kode || x.deskripsi.slice(0, 30)}"?`)) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="CPMK">
      <ListHeader
        accentKey="obe"
        icon={ListChecks}
        title="Capaian Pembelajaran Mata Kuliah"
        description="Kelola CPMK untuk setiap mata kuliah."
        count={rows.length}
        countLabel="CPMK (MK ini)"
      >
        {manage && (
          <Button onClick={openCreate} disabled={!courseId}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah CPMK
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} />
          <div>
            <Label htmlFor="cpmk-course" className="mb-1.5 block">Mata Kuliah</Label>
            <NativeSelect id="cpmk-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={courses.length === 0}>
              {courses.length === 0 && <option value="">— belum ada mata kuliah —</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>Sem {c.semester} · {c.kode ? `${c.kode} — ` : ""}{c.nama}</option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !courseId ? (
          <EmptyState title="Pilih mata kuliah" description="Tambahkan mata kuliah di menu Kurikulum terlebih dahulu." />
        ) : rows.length === 0 ? (
          <EmptyState title="Belum ada CPMK" description={manage ? "Klik Tambah CPMK untuk membuat yang pertama." : "Data akan tampil di sini."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Kode</TableHead>
                <TableHead className="w-24">Bloom</TableHead>
                <TableHead className="w-24">Target</TableHead>
                <TableHead>Deskripsi</TableHead>
                {manage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id} className="group">
                  <TableCell className="font-medium text-foreground">{x.kode || "—"}</TableCell>
                  <TableCell>{x.level_bloom ? <Badge variant="secondary">{x.level_bloom}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-muted-foreground">{x.target || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{x.deskripsi}</TableCell>
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

      {courseId && (
        <CpmkFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          courseId={courseId}
          onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending}
        />
      )}
    </AppLayout>
  );
}
