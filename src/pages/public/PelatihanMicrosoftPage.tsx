import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Laptop, Upload, ExternalLink, Send, CheckCircle2, ClipboardList, CreditCard, BadgeCheck, UserPlus, Users } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { uploadFilePublic } from "@/lib/api/uploadApi";
import {
  submitPelatihanMicrosoft,
  listPelatihanMicrosoftPublic,
  type PelatihanMicrosoftInput,
  type PelatihanMicrosoftPublic,
} from "@/lib/api/publicApi";

const JENIS_OPTIONS = [
  "Microsoft Word",
  "Microsoft Excel",
  "Microsoft PowerPoint",
  "Microsoft Access",
  "Microsoft Office (Lengkap)",
];

const STEPS = [
  { icon: ClipboardList, title: "Isi Formulir", desc: "Pilih pelatihan dan lengkapi nama serta NPM." },
  { icon: CreditCard, title: "Unggah Bukti", desc: "Lampirkan bukti pembayaran pelatihan." },
  { icon: BadgeCheck, title: "Persetujuan", desc: "Admin memverifikasi & menyetujui pendaftaran Anda." },
];

const STATUS_META: Record<PelatihanMicrosoftPublic["status"], { label: string; variant: "default" | "secondary" | "destructive" }> = {
  approved: { label: "Disetujui", variant: "default" },
  pending: { label: "Menunggu", variant: "secondary" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";

const EMPTY_FORM = { nama: "", npm: "", jenis_pelatihan: JENIS_OPTIONS[0] };

export default function PelatihanMicrosoftPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [bukti, setBukti] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const listQ = useQuery({
    queryKey: ["public", "pelatihan-microsoft"],
    queryFn: listPelatihanMicrosoftPublic,
  });

  const mut = useMutation({
    mutationFn: (input: PelatihanMicrosoftInput) => submitPelatihanMicrosoft(input),
    onError: (e: Error) => toast.error(e.message || "Gagal mengirim pendaftaran"),
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setBukti("");
    setDone(false);
  };

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) resetForm();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ACCEPT.split(",").map((s) => s.trim().toLowerCase());
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Format tidak didukung. Gunakan PDF atau gambar (JPG/PNG).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFilePublic(file);
      setBukti(res.url);
      toast.success("Bukti pembayaran berhasil diunggah");
    } catch (err) {
      toast.error((err as Error).message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.npm.trim() || mut.isPending) return;
    if (!bukti) {
      toast.error("Mohon unggah bukti pembayaran terlebih dahulu.");
      return;
    }
    try {
      await mut.mutateAsync({ ...form, bukti_pembayaran: bukti });
    } catch {
      return; // error toast already shown
    }
    setDone(true);
    qc.invalidateQueries({ queryKey: ["public", "pelatihan-microsoft"] });
  };

  const rows = listQ.data ?? [];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
            <Laptop className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">Pelatihan Microsoft</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Daftarkan diri Anda untuk mengikuti pelatihan Microsoft yang diselenggarakan Program Studi PTIK.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card-hairline rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                <span className="font-display text-2xl font-medium text-muted-foreground/40">{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Registrants list + Daftar CTA */}
        <div className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-medium tracking-[-0.01em] text-foreground">
                <Users className="h-5 w-5 text-primary" /> Peserta Terdaftar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Daftar peserta yang telah mendaftar pelatihan beserta status verifikasinya.
              </p>
            </div>
            <Button onClick={() => setOpen(true)} className="shrink-0">
              <UserPlus className="mr-1.5 h-4 w-4" /> Daftar Pelatihan
            </Button>
          </div>

          <div className="card-hairline mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            {listQ.isLoading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Memuat data peserta…</div>
            ) : listQ.isError ? (
              <div className="py-16 text-center text-sm text-destructive">Gagal memuat data peserta.</div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">Belum ada peserta terdaftar</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Jadilah yang pertama mendaftar pelatihan Microsoft ini.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[1%] whitespace-nowrap">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NPM</TableHead>
                    <TableHead>Jenis Pelatihan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((x, i) => (
                    <TableRow key={x.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={x.nama} />
                          <span className="font-medium text-foreground">{x.nama}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{x.npm || "—"}</TableCell>
                      <TableCell>
                        {x.jenis_pelatihan ? (
                          <Badge variant="secondary">{x.jenis_pelatihan}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_META[x.status]?.variant ?? "secondary"}>
                          {STATUS_META[x.status]?.label ?? x.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Registration form dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <DialogTitle className="mt-4 font-display text-xl font-medium tracking-[-0.01em] text-foreground">
                Pendaftaran Terkirim!
              </DialogTitle>
              <DialogDescription className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Terima kasih. Pendaftaran pelatihan Anda telah kami terima dan sedang menunggu persetujuan admin.
              </DialogDescription>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="outline" onClick={resetForm}>Daftar lagi</Button>
                <Button onClick={() => onOpenChange(false)}>Selesai</Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em] text-foreground">
                  Formulir Pendaftaran
                </DialogTitle>
                <DialogDescription>Lengkapi data berikut untuk mendaftar pelatihan.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="m-jenis">Pilih Pelatihan <span className="text-destructive">*</span></Label>
                  <select
                    id="m-jenis"
                    value={form.jenis_pelatihan}
                    onChange={(e) => setForm((f) => ({ ...f, jenis_pelatihan: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-base shadow-sm transition-colors ring-offset-background hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 md:text-sm"
                  >
                    {JENIS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="m-nama">Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input id="m-nama" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} required autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-npm">NPM <span className="text-destructive">*</span></Label>
                    <Input id="m-npm" value={form.npm} onChange={(e) => setForm((f) => ({ ...f, npm: e.target.value }))} required inputMode="numeric" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Bukti Pembayaran <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input value={bukti} readOnly placeholder="Belum ada file diunggah…" />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Format: PDF atau gambar (JPG/PNG), maksimal 10MB.</p>
                  {bukti && (
                    <a href={bukti} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Lihat file
                    </a>
                  )}
                  <input ref={fileRef} type="file" className="hidden" accept={ACCEPT} onChange={onFile} />
                </div>

                <Button
                  type="submit"
                  className={cn("w-full")}
                  disabled={mut.isPending || uploading || !form.nama.trim() || !form.npm.trim() || !bukti}
                >
                  {mut.isPending ? "Mengirim…" : <>Kirim Pendaftaran <Send className="ml-1.5 h-4 w-4" /></>}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Pendaftaran Anda akan diverifikasi dan disetujui oleh admin.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
