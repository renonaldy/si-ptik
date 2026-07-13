import { Link } from "react-router-dom";
import { Code2, Smartphone, Globe, Database, Palette, ShieldCheck, ArrowRight } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/features/content/useSiteContent";

const SERVICES = [
  { icon: Globe, title: "Pengembangan Web", desc: "Website company profile, sistem informasi, dan aplikasi web." },
  { icon: Smartphone, title: "Aplikasi Mobile", desc: "Aplikasi Android/iOS untuk kebutuhan bisnis & instansi." },
  { icon: Database, title: "Sistem Informasi", desc: "Sistem manajemen data, ERP mini, dan dashboard analitik." },
  { icon: Palette, title: "UI/UX Design", desc: "Desain antarmuka yang modern, ramah pengguna, dan premium." },
  { icon: Code2, title: "Pelatihan IT", desc: "Workshop pemrograman, data, dan literasi digital." },
  { icon: ShieldCheck, title: "Konsultasi Teknologi", desc: "Pendampingan transformasi digital untuk UMKM & institusi." },
];

export default function KewirausahaanPage() {
  const { get } = useSiteContent();
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">PTIK IT Solution</span>
          <h1 className="mt-5 font-display text-4xl font-medium tracking-[-0.02em]">Kewirausahaan &amp; IT Solution</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            {get("kewirausahaan_intro", "Unit kewirausahaan mahasiswa & dosen PTIK yang menyediakan solusi teknologi profesional.")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="card-hairline shadow-glow-hover rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-hero-aurora card-hairline relative mt-12 overflow-hidden rounded-2xl p-8 text-center text-white shadow-soft-lg md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
          <h2 className="relative font-display text-2xl font-medium tracking-[-0.01em]">Butuh solusi teknologi?</h2>
          <p className="relative mx-auto mt-2 max-w-lg text-sm text-white/80">Konsultasikan kebutuhan digital Anda bersama tim PTIK IT Solution.</p>
          <Button size="lg" variant="secondary" className="relative mt-6" asChild>
            <Link to="/kontak">Hubungi Kami <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
