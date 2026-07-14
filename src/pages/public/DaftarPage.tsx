import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, UserPlus, FileCheck2, PartyPopper, Send } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPendaftaran, type PendaftaranInput } from "@/lib/api/publicApi";

const STEPS = [
  { icon: ClipboardList, title: "Isi Formulir", desc: "Lengkapi data diri pada formulir pendaftaran." },
  { icon: FileCheck2, title: "Verifikasi", desc: "Tim kami memverifikasi dan menghubungi Anda." },
  { icon: UserPlus, title: "Registrasi", desc: "Selesaikan proses registrasi & administrasi." },
  { icon: PartyPopper, title: "Diterima", desc: "Selamat bergabung menjadi mahasiswa PTIK!" },
];

const SPMB_URL = "https://spmb.bunghatta.ac.id/#daftar";

export default function DaftarPage() {
  const [form, setForm] = useState({ nama: "", email: "", no_hp: "", asal_sekolah: "", pesan: "" });
  const [redirecting, setRedirecting] = useState(false);
  const mut = useMutation({
    mutationFn: (input: PendaftaranInput) => submitPendaftaran(input),
    onError: (e: Error) => toast.error(e.message || "Gagal mengirim pendaftaran"),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || redirecting || mut.isPending) return;
    try {
      // Must register successfully first…
      await mut.mutateAsync({ ...form, jenis: "daftar" });
    } catch {
      return; // failed → stay on page (error toast already shown)
    }
    // …then hand off to SPMB.
    toast.success("Pendaftaran berhasil!");
    setRedirecting(true);
    setTimeout(() => {
      window.location.href = SPMB_URL;
    }, 3000);
  };

  return (
    <PublicLayout>
      {redirecting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-hairline w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-soft-lg">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <h3 className="mt-5 font-display text-lg font-medium text-foreground">Pendaftaran berhasil!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Anda akan diarahkan ke halaman SPMB Universitas Bung Hatta.
            </p>
          </div>
        </div>
      )}
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">Daftar PTIK</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Bergabunglah dengan Program Studi Pendidikan Teknik Informatika &amp; Komputer.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Form */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-foreground">Formulir Pendaftaran</h2>
            <p className="mt-1 text-sm text-muted-foreground">Isi data berikut, tim kami akan segera menghubungi Anda.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="d-nama">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input id="d-nama" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} required autoFocus />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="d-email">Email</Label>
                  <Input id="d-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d-hp">No. HP</Label>
                  <Input id="d-hp" type="tel" value={form.no_hp} onChange={(e) => setForm((f) => ({ ...f, no_hp: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-asal">Asal Sekolah</Label>
                <Input id="d-asal" value={form.asal_sekolah} onChange={(e) => setForm((f) => ({ ...f, asal_sekolah: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-pesan">Pesan / Pertanyaan</Label>
                <Textarea id="d-pesan" value={form.pesan} onChange={(e) => setForm((f) => ({ ...f, pesan: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={mut.isPending || redirecting || !form.nama.trim()}>
                {redirecting ? "Mengalihkan…" : mut.isPending ? "Mendaftarkan…" : <>Kirim Pendaftaran <Send className="ml-1.5 h-4 w-4" /></>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Setelah mengirim, Anda akan diarahkan ke halaman SPMB Universitas Bung Hatta.
              </p>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
