import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPendaftaran, type PendaftaranInput } from "@/lib/api/publicApi";
import { useSiteContent } from "@/features/content/useSiteContent";

export default function KontakPage() {
  const { get } = useSiteContent();
  const alamat = get("kontak_alamat", "Kampus PTIK, Jl. Pendidikan No. 1, Indonesia");
  const email = get("kontak_email", "info@ptik.id");
  const telepon = get("kontak_telepon", "(021) 123-4567");
  const jam = get("kontak_jam", "Senin–Jumat, 08.00–16.00 WIB");

  // Telepon -> WhatsApp: keep digits, 0xxx -> 62xxx.
  const waNumber = (() => {
    const d = telepon.replace(/\D/g, "");
    if (!d) return "";
    return d.startsWith("0") ? "62" + d.slice(1) : d.startsWith("62") ? d : "62" + d;
  })();

  const INFO = [
    { icon: MapPin, label: "Alamat", value: alamat, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamat)}`, hint: "Buka di Maps" },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}`, hint: "Kirim email" },
    { icon: Phone, label: "Telepon", value: telepon, href: waNumber ? `https://wa.me/${waNumber}` : undefined, hint: "Chat WhatsApp" },
    { icon: Clock, label: "Jam Layanan", value: jam, href: undefined, hint: undefined },
  ];
  const [form, setForm] = useState({ nama: "", email: "", pesan: "" });
  const mut = useMutation({
    mutationFn: (input: PendaftaranInput) => submitPendaftaran(input),
    onSuccess: () => {
      toast.success("Pesan terkirim. Terima kasih!");
      setForm({ nama: "", email: "", pesan: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengirim pesan"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) return;
    mut.mutate({ nama: form.nama, email: form.email, pesan: form.pesan, no_hp: "", asal_sekolah: "", jenis: "kontak" });
  };

  return (
    <PublicLayout>
      <PublicPageHeader
        eyebrow="Hubungi Kami"
        title={get("kontak_title", "Kontak")}
        subtitle={get("kontak_subtitle", "Punya pertanyaan? Hubungi kami atau kirim pesan.")}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-3">
            {INFO.map((i) => {
              const inner = (
                <>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><i.icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{i.label}</div>
                    <div className="break-words text-sm text-muted-foreground">{i.value}</div>
                    {i.href && <div className="mt-0.5 text-xs font-medium text-primary">{i.hint} →</div>}
                  </div>
                </>
              );
              return i.href ? (
                <a
                  key={i.label}
                  href={i.href}
                  target={i.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="card-hairline flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
                >
                  {inner}
                </a>
              ) : (
                <div key={i.label} className="card-hairline flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-foreground">Kirim Pesan</h2>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="k-nama">Nama <span className="text-destructive">*</span></Label>
                <Input id="k-nama" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="k-email">Email</Label>
                <Input id="k-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="k-pesan">Pesan</Label>
                <Textarea id="k-pesan" value={form.pesan} onChange={(e) => setForm((f) => ({ ...f, pesan: e.target.value }))} className="min-h-[120px]" />
              </div>
              <Button type="submit" className="w-full" disabled={mut.isPending || !form.nama.trim()}>
                {mut.isPending ? "Mengirim…" : <>Kirim Pesan <Send className="ml-1.5 h-4 w-4" /></>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
