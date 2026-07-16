import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import { BLOOM_LEVELS, type CPMK, type CPMKInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CPMK | null;
  courseId: string;
  onSubmit: (input: CPMKInput) => void;
  isPending: boolean;
}

export function CpmkFormDialog({ open, onOpenChange, initial, courseId, onSubmit, isPending }: Props) {
  const empty: CPMKInput = { course_id: courseId, kode: "", deskripsi: "", level_bloom: "", target: "" };
  const [form, setForm] = useState<CPMKInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? { course_id: initial.course_id, kode: initial.kode, deskripsi: initial.deskripsi, level_bloom: initial.level_bloom, target: initial.target }
          : { ...empty },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const canSubmit = form.deskripsi.trim().length > 0;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ListChecks}
      title={initial ? "Edit CPMK" : "Tambah CPMK"}
      description={initial ? "Perbarui capaian pembelajaran mata kuliah." : "Tambahkan capaian pembelajaran mata kuliah."}
      onSubmit={() => onSubmit({ ...form, course_id: courseId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cpmk-kode">Kode CPMK</Label>
          <Input id="cpmk-kode" value={form.kode} autoFocus onChange={(e) => setForm((f) => ({ ...f, kode: e.target.value }))} placeholder="CPMK-01" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpmk-bloom">Level Bloom</Label>
          <NativeSelect id="cpmk-bloom" value={form.level_bloom} onChange={(e) => setForm((f) => ({ ...f, level_bloom: e.target.value }))}>
            <option value="">—</option>
            {BLOOM_LEVELS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpmk-target">Target</Label>
          <Input id="cpmk-target" value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} placeholder="80%" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cpmk-desk">Deskripsi <span className="text-destructive">*</span></Label>
        <Textarea id="cpmk-desk" rows={4} value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
      </div>
    </ObeFormDialog>
  );
}
