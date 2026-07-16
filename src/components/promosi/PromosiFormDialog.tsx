import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

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
import { NativeSelect } from "@/components/obe/NativeSelect";
import { Textarea } from "@/components/ui/textarea";
import { accentStyle } from "@/lib/moduleColors";
import { parseYouTubeId, parseGDrive, youTubeThumb } from "@/lib/videoEmbed";
import type { Promosi, PromosiInput } from "@/lib/api/promosiApi";

interface PromosiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Promosi | null;
  onSubmit: (input: PromosiInput) => void;
  isPending: boolean;
}

const EMPTY: PromosiInput = { judul: "", tipe: "flyer", media: "", sumber: "upload", keterangan: "", tanggal: "" };

function toInput(x: Promosi): PromosiInput {
  const { id, created_at, updated_at, ...rest } = x;
  if (!rest.sumber) rest.sumber = "upload"; // legacy flyers predate the sumber field
  return rest;
}

// Live hint for pasted video links — warns early when the URL won't embed.
function LinkHint({ sumber, media }: { sumber: string; media: string }) {
  if (!media) return null;
  if (sumber === "youtube") {
    const id = parseYouTubeId(media);
    return id ? (
      <img src={youTubeThumb(id)} alt="Pratinjau video" className="mt-1 h-20 rounded-md border border-border object-cover" />
    ) : (
      <p className="text-xs text-destructive">Link YouTube tidak dikenali. Contoh: https://www.youtube.com/watch?v=…</p>
    );
  }
  if (sumber === "gdrive") {
    const g = parseGDrive(media);
    return g ? (
      <p className="text-xs text-muted-foreground">Terdeteksi {g.kind === "folder" ? "folder" : "file"} Google Drive. Pastikan aksesnya "Siapa saja yang memiliki link".</p>
    ) : (
      <p className="text-xs text-destructive">Link Google Drive tidak dikenali. Tempel link file (/file/d/…) atau folder (/drive/folders/…).</p>
    );
  }
  return null;
}

export function PromosiFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: PromosiFormDialogProps) {
  const [form, setForm] = useState<PromosiInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const isVideo = form.tipe === "video";

  const setTipe = (tipe: PromosiInput["tipe"]) =>
    setForm((f) => ({ ...f, tipe, media: "", sumber: tipe === "video" ? "youtube" : "upload" }));
  const setSumber = (sumber: PromosiInput["sumber"]) =>
    setForm((f) => ({ ...f, sumber, media: "" }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.media.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("promosi")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />

        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Promosi" : "Tambah Promosi"}
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
                Judul<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="judul"
                value={form.judul}
                onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tipe">Tipe</Label>
                <NativeSelect id="tipe" value={form.tipe} onChange={(e) => setTipe(e.target.value as PromosiInput["tipe"])}>
                  <option value="flyer">Flyer</option>
                  <option value="video">Video</option>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sumber">{isVideo ? "Sumber Video" : "Sumber Flyer"}</Label>
                <NativeSelect id="sumber" value={form.sumber} onChange={(e) => setSumber(e.target.value as PromosiInput["sumber"])}>
                  {isVideo ? (
                    <>
                      <option value="youtube">Link YouTube</option>
                      <option value="gdrive">Link Google Drive</option>
                      <option value="upload">Upload File</option>
                    </>
                  ) : (
                    <>
                      <option value="upload">Upload Gambar</option>
                      <option value="gdrive">Link Google Drive</option>
                    </>
                  )}
                </NativeSelect>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Media</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {form.sumber === "upload" ? (
              <FileUploadField
                label={isVideo ? "File Video" : "Gambar Flyer"}
                value={form.media}
                onChange={(url) => setForm((f) => ({ ...f, media: url }))}
                accept={isVideo ? ".mp4,.webm,.mov,.m4v" : ".png,.jpg,.jpeg,.webp"}
                hint={
                  isVideo
                    ? "Format: MP4, WebM, atau MOV (maks 100MB). Untuk video panjang, gunakan link YouTube/Google Drive."
                    : "Format: PNG, JPG, atau WebP (maks 10MB)."
                }
              />
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="media">
                  {form.sumber === "youtube" ? "Link YouTube" : "Link Google Drive"}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="media"
                  value={form.media}
                  onChange={(e) => setForm((f) => ({ ...f, media: e.target.value }))}
                  placeholder={
                    form.sumber === "youtube"
                      ? "https://www.youtube.com/watch?v=…"
                      : "https://drive.google.com/file/d/… atau /drive/folders/…"
                  }
                />
                <LinkHint sumber={form.sumber} media={form.media} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea id="keterangan" value={form.keterangan} onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input id="tanggal" type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.judul.trim() || !form.media.trim()}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
