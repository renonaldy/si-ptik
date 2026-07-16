import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import { TOTAL_SEMESTER, type Course, type CourseInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Course | null;
  curriculumId: string;
  defaultSemester?: number;
  onSubmit: (input: CourseInput) => void;
  isPending: boolean;
}

export function CourseFormDialog({ open, onOpenChange, initial, curriculumId, defaultSemester = 1, onSubmit, isPending }: Props) {
  const empty: CourseInput = {
    curriculum_id: curriculumId,
    kode: "",
    nama: "",
    sks: 0,
    semester: defaultSemester,
    deskripsi: "",
    rps_url: "",
  };
  const [form, setForm] = useState<CourseInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? {
              curriculum_id: initial.curriculum_id,
              kode: initial.kode,
              nama: initial.nama,
              sks: initial.sks,
              semester: initial.semester,
              deskripsi: initial.deskripsi,
              rps_url: initial.rps_url,
            }
          : { ...empty },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const canSubmit = form.nama.trim().length > 0;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BookOpen}
      title={initial ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
      description={initial ? "Perbarui data mata kuliah." : "Tambahkan mata kuliah ke kurikulum."}
      onSubmit={() => onSubmit({ ...form, curriculum_id: curriculumId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="mk-kode">Kode MK</Label>
          <Input id="mk-kode" value={form.kode} onChange={(e) => setForm((f) => ({ ...f, kode: e.target.value }))} placeholder="PTI101" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="mk-nama">Nama MK <span className="text-destructive">*</span></Label>
          <Input id="mk-nama" value={form.nama} autoFocus onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mk-sks">SKS</Label>
          <Input id="mk-sks" type="number" min={0} value={form.sks} onChange={(e) => setForm((f) => ({ ...f, sks: Number(e.target.value) || 0 }))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mk-sem">Semester</Label>
          <NativeSelect id="mk-sem" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}>
            {Array.from({ length: TOTAL_SEMESTER }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>Semester {n}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mk-desk">Deskripsi</Label>
        <Textarea id="mk-desk" rows={3} value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
      </div>
      <FileUploadField label="Dokumen RPS (opsional)" value={form.rps_url} onChange={(url) => setForm((f) => ({ ...f, rps_url: url }))} hint="PDF RPS mata kuliah" />
    </ObeFormDialog>
  );
}
