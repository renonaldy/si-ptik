import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, FolderOpen, ImageIcon } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listPromosiPublic } from "@/lib/api/publicApi";
import { flyerMedia } from "@/lib/videoEmbed";
import type { Promosi } from "@/lib/api/promosiApi";

function FlyerThumb({ f }: { f: Promosi }) {
  const m = flyerMedia(f.media, f.sumber);
  if (m.kind === "image") {
    return <img src={m.src} alt={f.judul} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />;
  }
  const Icon = m.kind === "folder" ? FolderOpen : ImageIcon;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-10 w-10" />
      {m.kind === "folder" && <span className="text-xs">Folder Google Drive</span>}
    </div>
  );
}

function FlyerViewer({ f }: { f: Promosi }) {
  const m = flyerMedia(f.media, f.sumber);
  if (m.kind === "image") {
    return <img src={m.full} alt={f.judul} className="max-h-[75vh] w-full bg-black object-contain" />;
  }
  if (m.kind === "folder") {
    return <iframe src={m.src} title={f.judul} className="h-[420px] w-full bg-background" />;
  }
  return null;
}

export default function PromosiFlyerPage() {
  const { data: flyers = [], isLoading } = useQuery({
    queryKey: ["public", "promosi", "flyer"],
    queryFn: () => listPromosiPublic("flyer"),
  });
  const [selected, setSelected] = useState<Promosi | null>(null);
  const selectedMedia = selected ? flyerMedia(selected.media, selected.sumber) : null;

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Promosi" title="Flyer" subtitle="Flyer dan poster promosi program studi — klik untuk melihat dan mengunduh." />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : flyers.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada flyer.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {flyers.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelected(f)}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted text-left shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FlyerThumb f={f} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="block text-sm font-medium text-white">{f.judul}</span>
                  {f.keterangan && <span className="line-clamp-1 block text-xs text-white/70">{f.keterangan}</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
          {selected && selectedMedia && (
            <>
              <FlyerViewer f={selected} />
              <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <DialogTitle className="text-base font-semibold">{selected.judul}</DialogTitle>
                  {selected.keterangan && <p className="mt-0.5 text-sm text-muted-foreground">{selected.keterangan}</p>}
                </div>
                {selectedMedia.kind === "image" && (
                  <Button asChild className="shrink-0">
                    <a href={selectedMedia.download} download target="_blank" rel="noreferrer">
                      <Download className="mr-1.5 h-4 w-4" /> Unduh Flyer
                    </a>
                  </Button>
                )}
                {selectedMedia.kind === "folder" && (
                  <Button asChild variant="outline" className="shrink-0">
                    <a href={selectedMedia.href} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Buka Folder di Google Drive
                    </a>
                  </Button>
                )}
                {selectedMedia.kind === "link" && (
                  <Button asChild variant="outline" className="shrink-0">
                    <a href={selectedMedia.href || selected.media} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Buka Flyer
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
