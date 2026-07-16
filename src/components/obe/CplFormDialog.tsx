import { useEffect, useState } from "react";
import { Target } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import { CPL_KATEGORI, type CPL, type CPLInput, type CplKategori } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CPL | null;
  curriculumId: string;
  onSubmit: (input: CPLInput) => void;
  isPending: boolean;
}

export function CplFormDialog({ open, onOpenChange, initial, curriculumId, onSubmit, isPending }: Props) {
  const empty: CPLInput = { curriculum_id: curriculumId, kode: "", deskripsi: "", kategori: "pengetahuan" };
  const [form, setForm] = useState<CPLInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? { curriculum_id: initial.curriculum_id, kode: initial.kode, deskripsi: initial.deskripsi, kategori: initial.kategori }
          : { ...empty },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const canSubmit = form.deskripsi.trim().length > 0;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Target}
      title={initial ? "Edit CPL" : "Tambah CPL"}
      description={initial ? "Perbarui capaian pembelajaran lulusan." : "Tambahkan capaian pembelajaran lulusan."}
      onSubmit={() => onSubmit({ ...form, curriculum_id: curriculumId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cpl-kode">Kode CPL</Label>
          <Input id="cpl-kode" value={form.kode} autoFocus onChange={(e) => setForm((f) => ({ ...f, kode: e.target.value }))} placeholder="CPL-01" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpl-kat">Kategori</Label>
          <NativeSelect id="cpl-kat" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value as CplKategori }))}>
            {CPL_KATEGORI.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cpl-desk">Deskripsi <span className="text-destructive">*</span></Label>
        <Textarea id="cpl-desk" rows={4} value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
      </div>
    </ObeFormDialog>
  );
}
