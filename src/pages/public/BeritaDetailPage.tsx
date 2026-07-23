import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, User } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { getBeritaPublic } from "@/lib/api/publicApi";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

export default function BeritaDetailPage() {
  const { id = "" } = useParams();
  const { data: b, isLoading, isError } = useQuery({
    queryKey: ["public", "berita", id],
    queryFn: () => getBeritaPublic(id),
    enabled: !!id,
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/berita"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Berita</Link>
        </Button>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError || !b ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Berita tidak ditemukan.
          </div>
        ) : (
          <article>
            <h1 className="text-justify font-display text-3xl font-medium leading-tight tracking-[-0.02em] text-foreground">{b.judul}</h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {b.tanggal || "—"}</span>
              {b.penulis && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {b.penulis}</span>}
            </div>
            {b.gambar && (
              <img src={b.gambar} alt={b.judul} className="mt-6 aspect-video w-full rounded-2xl border border-border object-cover" />
            )}
            {b.ringkasan && (
              <div
                className="mt-6 text-justify text-lg font-medium leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.ringkasan) }}
              />
            )}
            <div className="mt-4 whitespace-pre-line text-justify text-[15px] leading-relaxed text-muted-foreground">{b.konten}</div>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}
