import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FolderOpen, Play } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listPromosiPublic } from "@/lib/api/publicApi";
import { videoEmbed } from "@/lib/videoEmbed";
import type { Promosi } from "@/lib/api/promosiApi";

function VideoThumb({ v }: { v: Promosi }) {
  const embed = videoEmbed(v.media, v.sumber);
  if (embed.kind === "iframe" && embed.thumb) {
    return <img src={embed.thumb} alt={v.judul} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />;
  }
  if (embed.kind === "file") {
    return <video src={embed.src} preload="metadata" muted playsInline className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <FolderOpen className="h-10 w-10" />
    </div>
  );
}

function VideoPlayer({ v }: { v: Promosi }) {
  const embed = videoEmbed(v.media, v.sumber);
  if (embed.kind === "file") {
    return <video src={embed.src} controls autoPlay playsInline className="aspect-video w-full bg-black" />;
  }
  if (embed.kind === "iframe") {
    return (
      <iframe
        src={embed.src}
        title={v.judul}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full bg-black"
      />
    );
  }
  if (embed.kind === "folder") {
    return (
      <div>
        <iframe src={embed.src} title={v.judul} className="h-[420px] w-full bg-background" />
        <div className="border-t border-border p-3 text-center">
          <Button asChild variant="outline" size="sm">
            <a href={embed.href} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" /> Buka Folder di Google Drive
            </a>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-10 text-center">
      <Button asChild>
        <a href={embed.href || v.media} target="_blank" rel="noreferrer">
          <ExternalLink className="mr-1.5 h-4 w-4" /> Buka Video
        </a>
      </Button>
    </div>
  );
}

export default function PromosiVideoPage() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["public", "promosi", "video"],
    queryFn: () => listPromosiPublic("video"),
  });
  const [selected, setSelected] = useState<Promosi | null>(null);

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Promosi" title="Video Promosi" subtitle="Video profil dan promosi kegiatan program studi." />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada video.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v)}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left shadow-soft transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <VideoThumb v={v} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5" />
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-medium text-foreground">{v.judul}</div>
                  {v.keterangan && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{v.keterangan}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
          {selected && (
            <>
              <VideoPlayer v={selected} />
              <div className="border-t border-border p-4">
                <DialogTitle className="text-base font-semibold">{selected.judul}</DialogTitle>
                {selected.keterangan && <p className="mt-0.5 text-sm text-muted-foreground">{selected.keterangan}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
