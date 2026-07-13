import { useQuery } from "@tanstack/react-query";
import { FileText, Download as DownloadIcon } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDownloadPublic } from "@/lib/api/publicApi";

export default function DownloadPublicPage() {
  const { data: files = [], isLoading } = useQuery({ queryKey: ["public", "download"], queryFn: listDownloadPublic });

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow="Berkas" title="Download" subtitle="Dokumen, panduan, dan berkas program studi." />
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : files.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Belum ada berkas.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {files.map((f) => (
              <div key={f.id} className="card-hairline flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{f.judul}</span>
                    {f.kategori && <Badge variant="secondary">{f.kategori}</Badge>}
                  </div>
                  {f.keterangan && <p className="truncate text-sm text-muted-foreground">{f.keterangan}</p>}
                </div>
                <Button variant="outline" size="sm" asChild disabled={!f.file}>
                  <a href={f.file || "#"} target="_blank" rel="noreferrer">
                    <DownloadIcon className="mr-1.5 h-4 w-4" /> Unduh
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
