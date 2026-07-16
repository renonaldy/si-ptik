import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import { ASSESSMENT_JENIS, type Assessment, type AssessmentInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Assessment | null;
  courseId: string;
  /** Σ bobot assessment lain pada MK+TA yang sama — untuk hint sisa bobot. */
  usedBobot: number;
  onSubmit: (input: AssessmentInput) => void;
  isPending: boolean;
}

export function AssessmentFormDialog({ open, onOpenChange, initial, courseId, usedBobot, onSubmit, isPending }: Props) {
  const empty: AssessmentInput = { course_id: courseId, nama: "", jenis: "tugas", bobot: 0, semester: "", tahun_akademik: "" };
  const [form, setForm] = useState<AssessmentInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? {
              course_id: initial.course_id,
              nama: initial.nama,
              jenis: initial.jenis,
              bobot: initial.bobot,
              semester: initial.semester,
              tahun_akademik: initial.tahun_akademik,
            }
          : { ...empty },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const sisa = Math.max(0, 100 - usedBobot);
  const canSubmit = form.nama.trim().length > 0 && form.bobot >= 0 && form.bobot <= 100;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ClipboardCheck}
      title={initial ? "Edit Assessment" : "Tambah Assessment"}
      description={initial ? "Perbarui komponen penilaian." : "Tambahkan komponen penilaian mata kuliah."}
      onSubmit={() => onSubmit({ ...form, course_id: initial ? form.course_id : courseId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="asm-nama">Nama Assessment <span className="text-destructive">*</span></Label>
          <Input id="asm-nama" value={form.nama} autoFocus onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} placeholder="Tugas / UTS / UAS…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="asm-jenis">Jenis</Label>
          <NativeSelect id="asm-jenis" value={form.jenis} onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))}>
            {ASSESSMENT_JENIS.map((j) => (
              <option key={j.value} value={j.value}>{j.label}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="asm-bobot">Bobot (%)</Label>
          <Input id="asm-bobot" type="number" min={0} max={100} value={form.bobot} onChange={(e) => setForm((f) => ({ ...f, bobot: Number(e.target.value) || 0 }))} />
          <p className="text-xs text-muted-foreground">Sisa bobot tersedia: {sisa}%.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="asm-sem">Semester</Label>
          <Input id="asm-sem" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} placeholder="Ganjil" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="asm-ta">Tahun Akademik</Label>
          <Input id="asm-ta" value={form.tahun_akademik} onChange={(e) => setForm((f) => ({ ...f, tahun_akademik: e.target.value }))} placeholder="2024/2025" />
        </div>
      </div>
    </ObeFormDialog>
  );
}
