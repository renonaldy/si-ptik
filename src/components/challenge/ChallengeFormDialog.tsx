import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

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
import { PointListField } from "@/components/challenge/PointListField";
import { HashtagListField } from "@/components/challenge/HashtagListField";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { Textarea } from "@/components/ui/textarea";
import { accentStyle } from "@/lib/moduleColors";
import type { Challenge, ChallengeInput } from "@/lib/api/challengeApi";

interface ChallengeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Challenge | null;
  onSubmit: (input: ChallengeInput) => void;
  isPending: boolean;
}

const EMPTY: ChallengeInput = {
  judul: "",
  deskripsi: "",
  poster: "",
  lampiran: "",
  link_daftar: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  status: "aktif",
  tema_subjudul: "",
  tema: [],
  aturan: [],
  penilaian: [],
  penilaian_intro: "",
  hadiah: [],
  hadiah_intro: "",
  hashtags: [],
  caption_template: "",
};

function toInput(x: Challenge): ChallengeInput {
  const { id, created_at, updated_at, ...rest } = x;
  return rest;
}

export function ChallengeFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: ChallengeFormDialogProps) {
  const [form, setForm] = useState<ChallengeInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("challenge")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Challenge" : "Tambah Challenge"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui data di bawah ini." : "Lengkapi data baru."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-5 overflow-y-auto scrollbar-thin p-6">
            <div className="space-y-1.5">
              <Label htmlFor="judul">
                Judul Challenge<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="judul"
                value={form.judul}
                onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea id="deskripsi" value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Jadwal &amp; Status</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                <Input
                  id="tanggal_mulai"
                  type="date"
                  value={form.tanggal_mulai}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal_mulai: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                <Input
                  id="tanggal_selesai"
                  type="date"
                  value={form.tanggal_selesai}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal_selesai: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <NativeSelect
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ChallengeInput["status"] }))}
                >
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                </NativeSelect>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Tema Challenge</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tema_subjudul">Sub-judul Tema</Label>
              <Input
                id="tema_subjudul"
                value={form.tema_subjudul}
                onChange={(e) => setForm((f) => ({ ...f, tema_subjudul: e.target.value }))}
                placeholder='Contoh: "Kenapa Aku Pilih Informatika UBH?"'
              />
            </div>
            <PointListField
              label="Poin Tema"
              addLabel="Tambah Tema"
              value={form.tema}
              onChange={(tema) => setForm((f) => ({ ...f, tema }))}
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Aturan</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <PointListField
              label="Poin Aturan"
              addLabel="Tambah Aturan"
              iconPlaceholder="📏"
              judulPlaceholder="Contoh: Durasi Video"
              keteranganPlaceholder="Contoh: Maks. 60 detik"
              value={form.aturan}
              onChange={(aturan) => setForm((f) => ({ ...f, aturan }))}
            />
            <HashtagListField
              label="Wajib Pakai Hashtag"
              value={form.hashtags}
              onChange={(hashtags) => setForm((f) => ({ ...f, hashtags }))}
            />
            <div className="space-y-1.5">
              <Label htmlFor="caption_template">Template Caption</Label>
              <Textarea
                id="caption_template"
                value={form.caption_template}
                onChange={(e) => setForm((f) => ({ ...f, caption_template: e.target.value }))}
                placeholder="Caption yang bisa disalin peserta, mis. “Akhirnya resmi jadi Mahasiswa Baru…”"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Penilaian &amp; Hadiah</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="penilaian_intro">Intro Kriteria Penilaian</Label>
              <Textarea
                id="penilaian_intro"
                value={form.penilaian_intro}
                onChange={(e) => setForm((f) => ({ ...f, penilaian_intro: e.target.value }))}
                placeholder="Kalimat pembuka sebelum daftar kriteria (opsional)"
                rows={2}
              />
            </div>
            <PointListField
              label="Kriteria Penilaian"
              addLabel="Tambah Kriteria"
              iconPlaceholder="✅"
              judulPlaceholder="Contoh: Kreativitas"
              keteranganPlaceholder="Keterangan (opsional)"
              value={form.penilaian}
              onChange={(penilaian) => setForm((f) => ({ ...f, penilaian }))}
            />
            <div className="space-y-1.5">
              <Label htmlFor="hadiah_intro">Intro Hadiah</Label>
              <Textarea
                id="hadiah_intro"
                value={form.hadiah_intro}
                onChange={(e) => setForm((f) => ({ ...f, hadiah_intro: e.target.value }))}
                placeholder="Kalimat pembuka sebelum daftar hadiah (opsional)"
                rows={2}
              />
            </div>
            <PointListField
              label="Hadiah"
              addLabel="Tambah Hadiah"
              iconPlaceholder="🥇"
              judulPlaceholder="Contoh: Juara 1"
              keteranganPlaceholder="Contoh: Rp1.000.000 + Sertifikat"
              value={form.hadiah}
              onChange={(hadiah) => setForm((f) => ({ ...f, hadiah }))}
            />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Media &amp; Pendaftaran</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <FileUploadField
              label="Poster"
              value={form.poster}
              onChange={(url) => setForm((f) => ({ ...f, poster: url }))}
              accept=".png,.jpg,.jpeg,.webp"
              hint="Format: PNG, JPG, atau WebP (maks 10MB)."
            />
            <FileUploadField
              label="Lampiran (Panduan/Juknis)"
              value={form.lampiran}
              onChange={(url) => setForm((f) => ({ ...f, lampiran: url }))}
              accept=".pdf,.doc,.docx"
              hint="Format: PDF atau DOCX (maks 10MB). Opsional."
            />
            <div className="space-y-1.5">
              <Label htmlFor="link_daftar">Link Pendaftaran</Label>
              <Input
                id="link_daftar"
                value={form.link_daftar}
                onChange={(e) => setForm((f) => ({ ...f, link_daftar: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.judul.trim()}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
