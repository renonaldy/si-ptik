import { Pencil, Trash2, ImageIcon, Video, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flyerMedia, videoEmbed } from "@/lib/videoEmbed";
import type { Promosi } from "@/lib/api/promosiApi";

interface PromosiTableProps {
  data: Promosi[];
  canManage: boolean;
  onEdit: (x: Promosi) => void;
  onDelete: (x: Promosi) => void;
}

const SUMBER_LABEL: Record<string, string> = {
  upload: "Upload",
  youtube: "YouTube",
  gdrive: "Google Drive",
};

function Thumb({ x }: { x: Promosi }) {
  const cls = "h-10 w-10 shrink-0 rounded-lg border border-border object-cover";
  if (x.tipe === "flyer") {
    const m = flyerMedia(x.media, x.sumber);
    if (m.kind === "image") return <img src={m.src} alt={x.judul} className={cls} />;
    const FlyerIcon = m.kind === "folder" ? FolderOpen : ImageIcon;
    return (
      <div className={`${cls} flex items-center justify-center bg-muted text-muted-foreground`}><FlyerIcon className="h-4 w-4" /></div>
    );
  }
  const embed = videoEmbed(x.media, x.sumber);
  if (embed.kind === "iframe" && embed.thumb) return <img src={embed.thumb} alt={x.judul} className={cls} />;
  const Icon = embed.kind === "folder" ? FolderOpen : Video;
  return (
    <div className={`${cls} flex items-center justify-center bg-muted text-muted-foreground`}><Icon className="h-4 w-4" /></div>
  );
}

export function PromosiTable({ data, canManage, onEdit, onDelete }: PromosiTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Sumber</TableHead>
          <TableHead>Tanggal</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                <Thumb x={x} />
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{x.judul}</div>
                  {x.keterangan && <div className="line-clamp-1 max-w-[28rem] text-xs text-muted-foreground">{x.keterangan}</div>}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={x.tipe === "video" ? "default" : "secondary"}>
                {x.tipe === "video" ? "Video" : "Flyer"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{SUMBER_LABEL[x.sumber] ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.tanggal || "—"}</TableCell>
            {canManage && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(x)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(x)} title="Hapus">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
