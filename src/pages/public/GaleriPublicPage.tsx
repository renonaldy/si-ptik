import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { listGaleriPublic } from "@/lib/api/publicApi";

export default function GaleriPublicPage() {
  const { data: galeri = [], isLoading } = useQuery({ queryKey: ["public", "galeri"], queryFn: listGaleriPublic });

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Dokumentasi" title="Galeri PTIK" subtitle="Dokumentasi kegiatan dan fasilitas program studi." />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : galeri.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada foto.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {galeri.map((g) => (
              <figure key={g.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-soft">
                {g.gambar ? (
                  <img src={g.gambar} alt={g.judul} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                )}
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-sm font-medium text-white">{g.judul}</div>
                  {g.keterangan && <div className="line-clamp-1 text-xs text-white/70">{g.keterangan}</div>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
