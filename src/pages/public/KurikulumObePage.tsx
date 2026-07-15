import { Link } from "react-router-dom";
import { GraduationCap, Clock, ArrowLeft } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export default function KurikulumObePage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">Kurikulum OBE</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Outcome-Based Education — kurikulum berbasis capaian pembelajaran Program Studi PTIK.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="card-hairline mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-medium tracking-[-0.01em] text-foreground">
            Segera Hadir
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Halaman Kurikulum OBE sedang kami siapkan. Nantikan informasi lengkapnya di sini
            dalam waktu dekat.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
