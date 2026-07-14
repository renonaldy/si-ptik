import { Link } from "react-router-dom";
import { CalendarDays, GraduationCap, ClipboardList, ArrowRight } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/features/content/useSiteContent";

export default function AkademikPage() {
  const { get } = useSiteContent();

  const info = [
    { icon: GraduationCap, k: "Jenjang", v: get("akademik_jenjang", "Sarjana (S1)") },
    { icon: ClipboardList, k: "Total SKS", v: get("akademik_sks", "144 SKS") },
    { icon: CalendarDays, k: "Masa Studi", v: get("akademik_masa", "8 Semester") },
  ];

  return (
    <PublicLayout>
      <PublicPageHeader
        eyebrow="Akademik"
        title="Informasi Akademik"
        subtitle="Program Studi Pendidikan Teknik Informatika dan Komputer (PTIK)."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:px-6 md:py-16">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {info.map((x) => (
            <div key={x.k} className="card-hairline rounded-xl border border-border bg-card p-6 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <x.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-sm text-muted-foreground">{x.k}</div>
              <div className="text-lg font-semibold text-foreground">{x.v}</div>
            </div>
          ))}
        </section>

        {/* Quick links to the other academic pages */}
        <section className="grid gap-4 sm:grid-cols-2">
          {[
            { to: "/akademik/kurikulum", label: "Kurikulum", desc: "Struktur matakuliah per semester." },
            { to: "/akademik/ujian", label: "Kegiatan Ujian", desc: "Jadwal & status peserta ujian." },
            { to: "/akademik/profil-lulusan", label: "Profil Lulusan", desc: "Kompetensi & peran lulusan." },
            { to: "/akademik/prospek-kerja", label: "Prospek Kerja", desc: "Peluang karier lulusan." },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="card-hairline shadow-glow-hover group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5"
            >
              <div>
                <div className="font-semibold text-foreground group-hover:text-primary">{l.label}</div>
                <div className="text-sm text-muted-foreground">{l.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </section>
      </div>
    </PublicLayout>
  );
}
