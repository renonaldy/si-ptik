import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import type { CPMK, RPS, RPSInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: RPS | null;
  courseId: string;
  cpmkOptions: CPMK[];
  onSubmit: (input: RPSInput) => void;
  isPending: boolean;
}

export function RpsFormDialog({ open, onOpenChange, initial, courseId, cpmkOptions, onSubmit, isPending }: Props) {
  const empty: RPSInput = { course_id: courseId, minggu: 1, cpmk_id: null, materi: "", metode: "", assessment: "" };
  const [form, setForm] = useState<RPSInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? {
              course_id: initial.course_id,
              minggu: initial.minggu,
              cpmk_id: initial.cpmk_id,
              materi: initial.materi,
              metode: initial.metode,
              assessment: initial.assessment,
            }
          : { ...empty },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const canSubmit = form.minggu >= 1;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ClipboardList}
      title={initial ? "Edit Baris RPS" : "Tambah Baris RPS"}
      description={initial ? "Perbarui rencana pembelajaran." : "Tambahkan minggu ke rencana pembelajaran."}
      onSubmit={() => onSubmit({ ...form, course_id: courseId })}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rps-minggu">Minggu <span className="text-destructive">*</span></Label>
          <Input id="rps-minggu" type="number" min={1} value={form.minggu} onChange={(e) => setForm((f) => ({ ...f, minggu: Number(e.target.value) || 1 }))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rps-cpmk">CPMK</Label>
          <NativeSelect
            id="rps-cpmk"
            value={form.cpmk_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, cpmk_id: e.target.value || null }))}
          >
            <option value="">— tidak ada —</option>
            {cpmkOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.kode ? `${c.kode} — ` : ""}{c.deskripsi.slice(0, 60)}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rps-materi">Materi</Label>
        <Textarea id="rps-materi" rows={2} value={form.materi} onChange={(e) => setForm((f) => ({ ...f, materi: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rps-metode">Metode Pembelajaran</Label>
          <Input id="rps-metode" value={form.metode} onChange={(e) => setForm((f) => ({ ...f, metode: e.target.value }))} placeholder="Ceramah, diskusi…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rps-assess">Assessment</Label>
          <Input id="rps-assess" value={form.assessment} onChange={(e) => setForm((f) => ({ ...f, assessment: e.target.value }))} placeholder="Kuis, tugas…" />
        </div>
      </div>
    </ObeFormDialog>
  );
}
