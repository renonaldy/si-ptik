import { Target, Compass, CheckCircle2 } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { useSiteContent } from "@/features/content/useSiteContent";

const DEFAULT_VISI =
  "Menjadi program studi unggulan yang menghasilkan pendidik dan profesional teknologi informasi yang kompeten, inovatif, dan berdaya saing global pada tahun 2030.";
const DEFAULT_MISI = [
  "Menyelenggarakan pendidikan berkualitas di bidang teknik informatika dan komputer.",
  "Mengembangkan penelitian yang inovatif dan aplikatif bagi masyarakat.",
  "Melaksanakan pengabdian kepada masyarakat berbasis teknologi.",
  "Membangun kerja sama dengan dunia industri dan institusi pendidikan.",
  "Menumbuhkan jiwa kewirausahaan berbasis teknologi bagi mahasiswa.",
];
const DEFAULT_TUJUAN = [
  "Menghasilkan lulusan yang kompeten, profesional, dan berakhlak.",
  "Menghasilkan karya penelitian yang bermanfaat dan terpublikasi.",
  "Meningkatkan peran program studi dalam pembangunan masyarakat.",
];

export default function VisiMisiPage() {
  const { get, getList } = useSiteContent();
  const visi = get("visi", DEFAULT_VISI);
  const misi = getList("misi", DEFAULT_MISI);
  const tujuan = getList("tujuan", DEFAULT_TUJUAN);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-hero-aurora text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">Visi &amp; Misi</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Arah dan komitmen Program Studi PTIK.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 md:px-6">
        <div className="card-hairline rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Compass className="h-5 w-5" /></div>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-foreground">Visi</h2>
          </div>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{visi}</p>
        </div>

        <div className="card-hairline rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Target className="h-5 w-5" /></div>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-foreground">Misi</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {misi.map((m, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-hairline rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-foreground">Tujuan</h2>
          <ul className="mt-4 space-y-3">
            {tujuan.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PublicLayout>
  );
}
