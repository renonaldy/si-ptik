import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";

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
import { JENIS_OPTIONS, STATUS_OPTIONS, type Ujian, type UjianInput } from "@/lib/api/ujianApi";
import { listDosen } from "@/lib/api/dosenApi";

interface UjianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Ujian | null;
  onSubmit: (input: UjianInput) => void;
  isPending: boolean;
}

const EMPTY: UjianInput = {
  nama: "",
  npm: "",
  jenis: "sempro",
  judul: "",
  pembimbing: "",
  penguji1: "",
  penguji2: "",
  tanggal: "",
  jam: "",
  jam_selesai: "",
  ruang: "",
  status: "akan",
  foto: "",
  file_skripsi: "",
  file_ppt: "",
};

function toInput(x: Ujian): UjianInput {
  const { id, created_at, updated_at, ...rest } = x;
  return rest;
}

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function UjianFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: UjianFormDialogProps) {
  const [form, setForm] = useState<UjianInput>(EMPTY);

  // Dosen list drives the pembimbing/penguji dropdowns.
  const { data: dosen = [] } = useQuery({ queryKey: ["dosen", { search: "" }], queryFn: () => listDosen(), enabled: open });
  const dosenNames = dosen.map((d) => d.nama_dosen).filter(Boolean);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const set = (key: keyof UjianInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) return;
    onSubmit(form);
  };

  const field = (key: keyof UjianInput, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>
        {label}
        {props.required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={key} value={form[key]} onChange={set(key)} {...props} />
    </div>
  );

  const dosenSelect = (key: "pembimbing" | "penguji1" | "penguji2", label: string) => {
    // Keep a manually-typed value selectable even if not in the dosen list.
    const cur = form[key];
    const extra = cur && !dosenNames.includes(cur) ? [cur] : [];
    return (
      <div className="space-y-1.5">
        <Label htmlFor={key}>{label}</Label>
        <select id={key} className={selectCls} value={cur} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}>
          <option value="">— pilih dosen —</option>
          {[...dosenNames, ...extra].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    );
  };

  const nativeSelect = (key: "jenis" | "status", label: string, options: { value: string; label: string }[]) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <select id={key} className={selectCls} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("ujian")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Jadwal Ujian" : "Tambah Jadwal Ujian"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui jadwal & status ujian." : "Tambahkan mahasiswa ke jadwal ujian."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto scrollbar-thin p-6">
            {field("nama", "Nama Mahasiswa", { required: true, autoFocus: true })}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Detail</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("npm", "NPM")}
              {nativeSelect("jenis", "Jenis Ujian", JENIS_OPTIONS)}
              {field("tanggal", "Tanggal Ujian", { type: "date" })}
              {nativeSelect("status", "Status (dasar)", STATUS_OPTIONS)}
              {field("jam", "Jam Mulai", { type: "time" })}
              {field("jam_selesai", "Jam Selesai", { type: "time" })}
              {field("ruang", "Ruang")}
              <div className="sm:col-span-2">{field("judul", "Judul")}</div>

              {dosenSelect("pembimbing", "Pembimbing")}
              <div className="hidden sm:block" />
              {dosenSelect("penguji1", "Penguji 1")}
              {dosenSelect("penguji2", "Penguji 2")}

              <div className="sm:col-span-2">
                <FileUploadField label="Foto Mahasiswa" value={form.foto} onChange={(url) => setForm((f) => ({ ...f, foto: url }))} accept=".png,.jpg,.jpeg,.webp" hint="Format: JPG, PNG, atau WEBP" />
              </div>
              <FileUploadField label="Berkas Skripsi" value={form.file_skripsi} onChange={(url) => setForm((f) => ({ ...f, file_skripsi: url }))} accept=".pdf,.doc,.docx" hint="Format: PDF atau DOCX" />
              <FileUploadField label="PPT Skripsi" value={form.file_ppt} onChange={(url) => setForm((f) => ({ ...f, file_ppt: url }))} accept=".ppt,.pptx" hint="Format: PPT atau PPTX" />
            </div>

            <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Jika <span className="font-medium text-foreground">Tanggal</span> &amp; <span className="font-medium text-foreground">Jam</span> diisi,
              status mengikuti waktu secara otomatis: <b>Akan</b> → <b>Sedang</b> (saat jam mulai) → <b>Sudah</b> (setelah jam selesai).
            </p>
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
