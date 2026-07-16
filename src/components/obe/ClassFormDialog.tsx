import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import { listDosen } from "@/lib/api/dosenApi";
import type { Class, ClassInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Class | null;
  courseId: string;
  onSubmit: (input: ClassInput) => void;
  isPending: boolean;
}

export function ClassFormDialog({ open, onOpenChange, initial, courseId, onSubmit, isPending }: Props) {
  const empty: ClassInput = { course_id: courseId, nama: "", tahun_akademik: "", periode: "ganjil", dosen_id: null };
  const [form, setForm] = useState<ClassInput>(empty);
  const { data: dosens = [] } = useQuery({ queryKey: ["dosen", { search: "" }], queryFn: () => listDosen() });

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? {
              course_id: initial.course_id,
              nama: initial.nama,
              tahun_akademik: initial.tahun_akademik,
              periode: initial.periode,
              dosen_id: initial.dosen_id,
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
      icon={Users}
      title={initial ? "Edit Kelas" : "Tambah Kelas"}
      description={initial ? "Perbarui data kelas." : "Buat kelas (rombongan belajar) untuk mata kuliah ini."}
      onSubmit={() => onSubmit({ ...form, course_id: initial ? form.course_id : courseId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="kls-nama">Nama Kelas <span className="text-destructive">*</span></Label>
          <Input id="kls-nama" value={form.nama} autoFocus onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} placeholder="A" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kls-ta">Tahun Akademik</Label>
          <Input id="kls-ta" value={form.tahun_akademik} onChange={(e) => setForm((f) => ({ ...f, tahun_akademik: e.target.value }))} placeholder="2024/2025" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kls-periode">Periode</Label>
          <NativeSelect id="kls-periode" value={form.periode} onChange={(e) => setForm((f) => ({ ...f, periode: e.target.value }))}>
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kls-dosen">Dosen Pengampu</Label>
        <NativeSelect
          id="kls-dosen"
          value={form.dosen_id ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, dosen_id: e.target.value || null }))}
        >
          <option value="">— belum ditentukan —</option>
          {dosens.map((d) => (
            <option key={d.id} value={d.id}>{d.nama_dosen}</option>
          ))}
        </NativeSelect>
      </div>
    </ObeFormDialog>
  );
}
