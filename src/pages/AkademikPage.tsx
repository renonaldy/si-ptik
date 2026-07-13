import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, GraduationCap, ClipboardList, MapPin, Clock3, CheckCircle2, Circle, ChevronRight } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { useSiteContent } from "@/features/content/useSiteContent";
import { useMinuteTick } from "@/hooks/useMinuteTick";
import { listUjianPublic } from "@/lib/api/publicApi";
import { jenisLabelLong, statusLabel, effectiveStatus } from "@/components/ujian/UjianBadges";
import type { Ujian } from "@/lib/api/ujianApi";

const JENIS = ["sempro", "kompre"];
const STATUS_ORDER: { key: string; icon: typeof Circle; tint: string }[] = [
  { key: "akan", icon: Circle, tint: "bg-slate-400" },
  { key: "sedang", icon: Clock3, tint: "bg-amber-500" },
  { key: "sudah", icon: CheckCircle2, tint: "bg-emerald-600" },
];

function StudentRow({ u }: { u: Ujian }) {
  return (
    <Link
      to={`/akademik/ujian/${u.id}`}
      className="group block rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-start gap-3">
        {u.foto ? (
          <img src={u.foto} alt={u.nama} className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {u.nama.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span className="truncate group-hover:text-primary">{u.nama}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">{u.npm || "—"}</div>
          {u.judul && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{u.judul}</div>}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {u.tanggal && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {u.tanggal}{u.jam ? ` · ${u.jam}` : ""}
              </span>
            )}
            {u.ruang && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {u.ruang}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AkademikPage() {
  const { get } = useSiteContent();
  useMinuteTick();
  const { data: ujian = [] } = useQuery({ queryKey: ["public", "ujian"], queryFn: listUjianPublic });

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
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:px-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {info.map((x) => (
            <div key={x.k} className="card-hairline rounded-xl border border-border bg-card p-5 shadow-soft">
              <x.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">{x.k}</div>
              <div className="text-lg font-semibold text-foreground">{x.v}</div>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-foreground">Kegiatan Ujian</h2>
            <p className="mt-1 text-sm text-muted-foreground">Jadwal dan status peserta ujian program studi.</p>
          </div>

          {JENIS.map((jenis) => {
            const items = ujian.filter((u) => u.jenis === jenis);
            return (
              <div key={jenis} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="border-b border-border bg-muted/30 px-5 py-4">
                  <h3 className="font-semibold text-foreground">{jenisLabelLong(jenis)}</h3>
                  <p className="text-xs text-muted-foreground">{items.length} peserta</p>
                </div>
                {items.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Belum ada jadwal.</div>
                ) : (
                  <div className="grid gap-5 p-5 md:grid-cols-3">
                    {STATUS_ORDER.map((st) => {
                      const group = items.filter((u) => effectiveStatus(u) === st.key);
                      return (
                        <div key={st.key}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${st.tint} text-white`}>
                              <st.icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm font-semibold text-foreground">{statusLabel(st.key)}</span>
                            <span className="text-xs text-muted-foreground">({group.length})</span>
                          </div>
                          <div className="space-y-2">
                            {group.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">—</div>
                            ) : (
                              group.map((u) => <StudentRow key={u.id} u={u} />)
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </PublicLayout>
  );
}
