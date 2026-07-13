import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { accentStyle } from "@/lib/moduleColors";
import { listDosen } from "@/lib/api/dosenApi";
import type { Sempro, SemproInput } from "@/lib/api/semproApi";

interface SemproFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Sempro | null;
  onSubmit: (input: SemproInput) => void;
  isPending: boolean;
}

const EMPTY: SemproInput = { nama: "", npm: "", judul: "", pembimbing: "", file: "" };

function toInput(x: Sempro): SemproInput {
  const { id, created_at, updated_at, ...rest } = x;
  return rest;
}

export function SemproFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: SemproFormDialogProps) {
  const [form, setForm] = useState<SemproInput>(EMPTY);

  const { data: dosen = [] } = useQuery({ queryKey: ["dosen", { search: "" }], queryFn: () => listDosen(), enabled: open });
  const dosenNames = dosen.map((d) => d.nama_dosen).filter(Boolean);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const set = (key: keyof SemproInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) return;
    onSubmit(form);
  };

  const field = (key: keyof SemproInput, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>
        {label}
        {props.required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={key} value={form[key]} onChange={set(key)} {...props} />
    </div>
  );

  // Pembimbing dropdown sourced from Data Dosen (keeps a typed value selectable).
  const dosenExtra = form.pembimbing && !dosenNames.includes(form.pembimbing) ? [form.pembimbing] : [];
  const pembimbingField = (
    <div className="space-y-1.5">
      <Label htmlFor="pembimbing">Pembimbing</Label>
      <select
        id="pembimbing"
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        value={form.pembimbing}
        onChange={(e) => setForm((f) => ({ ...f, pembimbing: e.target.value }))}
      >
        <option value="">— pilih dosen —</option>
        {[...dosenNames, ...dosenExtra].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("sempro")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Seminar Proposal" : "Tambah Seminar Proposal"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui data di bawah ini." : "Lengkapi data baru."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto scrollbar-thin p-6">
            {field("nama", "Nama", { required: true, autoFocus: true })}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Detail</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("npm", "NPM")}
            {field("judul", "Judul")}
            {pembimbingField}
            <FileUploadField label="Berkas Proposal" value={form.file} onChange={(url) => setForm((f) => ({ ...f, file: url }))} accept=".pdf,.doc,.docx" hint="Format: PDF atau DOCX" />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.nama.trim()}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
