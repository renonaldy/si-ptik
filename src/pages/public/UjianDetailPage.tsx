import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, User, GraduationCap, BookOpen, FileText, Presentation, Download } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { getUjianPublic } from "@/lib/api/publicApi";
import { jenisLabelLong, JenisBadge, StatusBadge, effectiveStatus } from "@/components/ujian/UjianBadges";
import { useMinuteTick } from "@/hooks/useMinuteTick";

function Detail({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function UjianDetailPage() {
  const { id = "" } = useParams();
  useMinuteTick();
  const { data: u, isLoading, isError } = useQuery({
    queryKey: ["public", "ujian", id],
    queryFn: () => getUjianPublic(id),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/akademik"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Akademik</Link>
        </Button>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError || !u ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Data ujian tidak ditemukan.
          </div>
        ) : (
          <div className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center md:p-8">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
                {u.foto ? (
                  <img src={u.foto} alt={u.nama} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl font-bold text-muted-foreground">
                    {u.nama.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <JenisBadge jenis={u.jenis} />
                  <StatusBadge status={effectiveStatus(u)} />
                </div>
                <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.01em] text-foreground">{u.nama}</h1>
                <p className="text-sm text-muted-foreground">{u.npm || "—"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{jenisLabelLong(u.jenis)}</p>
              </div>
            </div>

            <div className="grid gap-5 border-t border-border p-6 sm:grid-cols-2 md:p-8">
              <Detail icon={BookOpen} label="Judul" value={u.judul} />
              <Detail icon={User} label="Pembimbing" value={u.pembimbing} />
              <Detail icon={User} label="Penguji 1" value={u.penguji1} />
              <Detail icon={User} label="Penguji 2" value={u.penguji2} />
              <Detail
                icon={CalendarDays}
                label="Waktu"
                value={u.tanggal ? `${u.tanggal}${u.jam ? ` · ${u.jam}${u.jam_selesai ? `–${u.jam_selesai}` : ""}` : ""}` : ""}
              />
              <Detail icon={MapPin} label="Ruang" value={u.ruang} />
              <Detail icon={GraduationCap} label="NPM" value={u.npm} />
            </div>

            {(u.file_skripsi || u.file_ppt) && (
              <div className="border-t border-border p-6 md:p-8">
                <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Berkas</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {u.file_skripsi && (
                    <a
                      href={u.file_skripsi}
                      target="_blank"
                      rel="noreferrer"
                      className="card-hairline group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">Berkas Skripsi</div>
                        <div className="text-xs text-muted-foreground">Dokumen skripsi (PDF)</div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </a>
                  )}
                  {u.file_ppt && (
                    <a
                      href={u.file_ppt}
                      target="_blank"
                      rel="noreferrer"
                      className="card-hairline group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Presentation className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">PPT Skripsi</div>
                        <div className="text-xs text-muted-foreground">Slide presentasi</div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
