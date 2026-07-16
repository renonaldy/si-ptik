import { useEffect, useState } from "react";
import { BookMarked } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { ObeFormDialog } from "./ObeFormDialog";
import type { Curriculum, CurriculumInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Curriculum | null;
  onSubmit: (input: CurriculumInput) => void;
  isPending: boolean;
}

const EMPTY: CurriculumInput = {
  nama: "",
  tahun: "",
  nomor_sk: "",
  tanggal_berlaku: "",
  deskripsi: "",
  buku_url: "",
  struktur_url: "",
  threshold: 70,
};

export function CurriculumFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: Props) {
  const [form, setForm] = useState<CurriculumInput>(EMPTY);

  useEffect(() => {
    if (open)
      setForm(
        initial
          ? {
              nama: initial.nama,
              tahun: initial.tahun,
              nomor_sk: initial.nomor_sk,
              tanggal_berlaku: initial.tanggal_berlaku,
              deskripsi: initial.deskripsi,
              buku_url: initial.buku_url,
              struktur_url: initial.struktur_url,
              threshold: initial.threshold || 70,
            }
          : EMPTY,
      );
  }, [open, initial]);

  const canSubmit = form.nama.trim().length > 0;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BookMarked}
      title={initial ? "Edit Kurikulum" : "Tambah Kurikulum"}
      description={initial ? "Perbarui data kurikulum." : "Buat kurikulum OBE baru."}
      onSubmit={() => onSubmit(form)}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      <div className="space-y-1.5">
        <Label htmlFor="c-nama">Nama Kurikulum <span className="text-destructive">*</span></Label>
        <Input id="c-nama" value={form.nama} autoFocus onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-tahun">Tahun</Label>
          <Input id="c-tahun" value={form.tahun} inputMode="numeric" placeholder="2024" onChange={(e) => setForm((f) => ({ ...f, tahun: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-sk">Nomor SK</Label>
          <Input id="c-sk" value={form.nomor_sk} onChange={(e) => setForm((f) => ({ ...f, nomor_sk: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-tgl">Tanggal Berlaku</Label>
          <Input id="c-tgl" type="date" value={form.tanggal_berlaku} onChange={(e) => setForm((f) => ({ ...f, tanggal_berlaku: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-threshold">Threshold Ketercapaian (%)</Label>
          <Input
            id="c-threshold"
            type="number"
            min={1}
            max={100}
            value={form.threshold}
            onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) || 0 }))}
          />
          <p className="text-xs text-muted-foreground">Batas "Tercapai" untuk CPMK/CPL/IK (CPMK dengan Target sendiri memakai targetnya).</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-desk">Deskripsi</Label>
        <Textarea id="c-desk" rows={3} value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FileUploadField label="Buku Kurikulum" value={form.buku_url} onChange={(url) => setForm((f) => ({ ...f, buku_url: url }))} hint="PDF Buku Kurikulum" />
        <FileUploadField label="Struktur Kurikulum" value={form.struktur_url} onChange={(url) => setForm((f) => ({ ...f, struktur_url: url }))} hint="PDF Struktur Kurikulum" />
      </div>
    </ObeFormDialog>
  );
}
