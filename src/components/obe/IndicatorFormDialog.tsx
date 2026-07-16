import { useEffect, useState } from "react";
import { Crosshair } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObeFormDialog } from "./ObeFormDialog";
import { NativeSelect } from "./NativeSelect";
import type { CPL, Indicator, IndicatorInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Indicator | null;
  cpls: CPL[];
  defaultCplId?: string;
  onSubmit: (input: IndicatorInput) => void;
  isPending: boolean;
}

export function IndicatorFormDialog({ open, onOpenChange, initial, cpls, defaultCplId, onSubmit, isPending }: Props) {
  const empty: IndicatorInput = { cpl_id: defaultCplId ?? cpls[0]?.id ?? "", kode: "", deskripsi: "" };
  const [form, setForm] = useState<IndicatorInput>(empty);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? { cpl_id: initial.cpl_id, kode: initial.kode, deskripsi: initial.deskripsi }
          : { cpl_id: defaultCplId ?? cpls[0]?.id ?? "", kode: "", deskripsi: "" },
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const canSubmit = form.deskripsi.trim().length > 0 && !!form.cpl_id;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Crosshair}
      title={initial ? "Edit Indikator Kinerja" : "Tambah Indikator Kinerja"}
      description={initial ? "Perbarui indikator kinerja." : "Tambahkan indikator kinerja turunan CPL."}
      onSubmit={() => onSubmit(form)}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="ik-kode">Kode IK</Label>
          <Input id="ik-kode" value={form.kode} autoFocus onChange={(e) => setForm((f) => ({ ...f, kode: e.target.value }))} placeholder="IK-1.1" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ik-cpl">CPL Induk</Label>
          <NativeSelect id="ik-cpl" value={form.cpl_id} onChange={(e) => setForm((f) => ({ ...f, cpl_id: e.target.value }))}>
            {cpls.map((c) => (
              <option key={c.id} value={c.id}>{c.kode ? `${c.kode} — ` : ""}{c.deskripsi.slice(0, 60)}</option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ik-desk">Deskripsi <span className="text-destructive">*</span></Label>
        <Textarea id="ik-desk" rows={3} value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} placeholder="mis. Perilaku disiplin, etis, dan bertanggung jawab." />
      </div>
    </ObeFormDialog>
  );
}
