import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Trophy } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Badge } from "@/components/ui/badge";
import type { Challenge } from "@/lib/api/challengeApi";
import { listChallengePublic } from "@/lib/api/publicApi";

function ChallengeThumb({ c }: { c: Challenge }) {
  if (c.poster) {
    return (
      <img
        src={c.poster}
        alt={c.judul}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary">
      <Trophy className="h-8 w-8" />
    </div>
  );
}

export default function ChallengePublicPage() {
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["public", "challenge"],
    queryFn: () => listChallengePublic(),
  });

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Pengembangan" title="Challenge" subtitle="Kompetisi dan tantangan untuk mahasiswa PTIK." />

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada challenge.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => (
              <Link
                key={c.id}
                to={`/challenge/${c.id}`}
                className="card-hairline shadow-glow-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5"
              >
                <div className="relative h-44 overflow-hidden bg-muted">
                  <ChallengeThumb c={c} />
                  <Badge
                    variant={c.status === "aktif" ? "default" : "secondary"}
                    className="absolute left-3 top-3 shadow-soft"
                  >
                    {c.status === "aktif" ? "Aktif" : "Selesai"}
                  </Badge>
                </div>
                <div className="p-5">
                  {(c.tanggal_mulai || c.tanggal_selesai) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {c.tanggal_mulai || "—"}
                      {c.tanggal_selesai ? ` – ${c.tanggal_selesai}` : ""}
                    </div>
                  )}
                  <h3 className="mt-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">{c.judul}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.deskripsi}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
