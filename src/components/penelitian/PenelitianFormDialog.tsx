import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";

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
import type { Penelitian, PenelitianInput } from "@/lib/api/penelitianApi";

interface PenelitianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Penelitian | null;
  onSubmit: (input: PenelitianInput) => void;
  isPending: boolean;
}

const EMPTY: PenelitianInput = { nama_penelitian: "", jenis_penelitian: "", author: "", tanggal: "", file: "" };

function toInput(x: Penelitian): PenelitianInput {
  const { id, created_at, updated_at, ...rest } = x;
  return rest;
}

export function PenelitianFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: PenelitianFormDialogProps) {
  const [form, setForm] = useState<PenelitianInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const set = (key: keyof PenelitianInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_penelitian.trim()) return;
    onSubmit(form);
  };

  const field = (key: keyof PenelitianInput, label: string, props: React.ComponentProps<typeof Input> = {}) => (
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
      <DialogContent style={accentStyle("penelitian")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Penelitian" : "Tambah Penelitian"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui data di bawah ini." : "Lengkapi data baru."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto scrollbar-thin p-6">
            {field("nama_penelitian", "Nama Penelitian", { required: true, autoFocus: true })}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Detail</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("jenis_penelitian", "Jenis")}
            {field("author", "Author")}
            {field("tanggal", "Tanggal", { type: "date" })}
            <FileUploadField label="File" value={form.file} onChange={(url) => setForm((f) => ({ ...f, file: url }))} />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.nama_penelitian.trim()}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
