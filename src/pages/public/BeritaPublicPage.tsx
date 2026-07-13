import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Newspaper, User, ArrowRight } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import type { Berita } from "@/lib/api/beritaApi";
import { listBeritaPublic } from "@/lib/api/publicApi";

function BeritaThumb({ b, className }: { b: Berita; className?: string }) {
  if (b.gambar) {
    return <img src={b.gambar} alt={b.judul} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${className ?? ""}`} />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary">
      <Newspaper className="h-8 w-8" />
    </div>
  );
}

export default function BeritaPublicPage() {
  const { data: berita = [], isLoading } = useQuery({ queryKey: ["public", "berita"], queryFn: listBeritaPublic });
  const [featured, ...rest] = berita;

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Informasi" title="Berita PTIK" subtitle="Kabar dan informasi terkini dari program studi." />

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : berita.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada berita.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured */}
            <Link
              to={`/berita/${featured.id}`}
              className="card-hairline shadow-glow-hover group grid overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 md:grid-cols-2"
            >
              <div className="relative h-56 overflow-hidden bg-muted md:h-full">
                <BeritaThumb b={featured} />
                <span className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                  Terbaru
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {featured.tanggal || "—"}</span>
                  {featured.penulis && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {featured.penulis}</span>}
                </div>
                <h2 className="mt-2 font-display text-2xl font-medium leading-tight tracking-[-0.01em] text-foreground group-hover:text-primary">
                  {featured.judul}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{featured.ringkasan}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Baca selengkapnya <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {/* Rest */}
            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((b) => (
                  <Link
                    key={b.id}
                    to={`/berita/${b.id}`}
                    className="card-hairline shadow-glow-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <BeritaThumb b={b} />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" /> {b.tanggal || "—"}
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">{b.judul}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{b.ringkasan}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
