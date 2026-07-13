import { useEffect, useState } from "react";
import { BookMarked } from "lucide-react";

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
import { DosenSelect } from "@/components/shared/DosenSelect";
import { accentStyle } from "@/lib/moduleColors";
import type { SkripsiAlumni, SkripsiAlumniInput } from "@/lib/api/skripsiAlumniApi";

interface SkripsiAlumniFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SkripsiAlumni | null;
  onSubmit: (input: SkripsiAlumniInput) => void;
  isPending: boolean;
}

const EMPTY: SkripsiAlumniInput = { nama_alumni: "", npm: "", judul_skripsi: "", pembimbing: "", file: "" };

function toInput(x: SkripsiAlumni): SkripsiAlumniInput {
  const { id, created_at, updated_at, ...rest } = x;
  return rest;
}

export function SkripsiAlumniFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: SkripsiAlumniFormDialogProps) {
  const [form, setForm] = useState<SkripsiAlumniInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const set = (key: keyof SkripsiAlumniInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_alumni.trim()) return;
    onSubmit(form);
  };

  const field = (key: keyof SkripsiAlumniInput, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>
        {label}
        {props.required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={key} value={form[key]} onChange={set(key)} {...props} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("skripsi-alumni")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <BookMarked className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Skripsi Alumni" : "Tambah Skripsi Alumni"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui data di bawah ini." : "Lengkapi data baru."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto scrollbar-thin p-6">
            {field("nama_alumni", "Nama Alumni", { required: true, autoFocus: true })}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Detail</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("npm", "NPM")}
            {field("judul_skripsi", "Judul Skripsi")}
            <DosenSelect label="Pembimbing" value={form.pembimbing} onChange={(v) => setForm((f) => ({ ...f, pembimbing: v }))} />
            <FileUploadField label="File" value={form.file} onChange={(url) => setForm((f) => ({ ...f, file: url }))} />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.nama_alumni.trim()}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
