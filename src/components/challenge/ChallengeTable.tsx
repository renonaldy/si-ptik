import { Pencil, Trash2, ImageIcon, ExternalLink } from "lucide-react";
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
import type { Challenge } from "@/lib/api/challengeApi";

interface ChallengeTableProps {
  data: Challenge[];
  canManage: boolean;
  onEdit: (x: Challenge) => void;
  onDelete: (x: Challenge) => void;
}

function Thumb({ x }: { x: Challenge }) {
  const cls = "h-10 w-10 shrink-0 rounded-lg border border-border object-cover";
  if (x.poster) return <img src={x.poster} alt={x.judul} className={cls} />;
  return (
    <div className={`${cls} flex items-center justify-center bg-muted text-muted-foreground`}>
      <ImageIcon className="h-4 w-4" />
    </div>
  );
}

export function ChallengeTable({ data, canManage, onEdit, onDelete }: ChallengeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Periode</TableHead>
          <TableHead>Pendaftaran</TableHead>
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
                  {x.deskripsi && <div className="line-clamp-1 max-w-[28rem] text-xs text-muted-foreground">{x.deskripsi}</div>}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={x.status === "aktif" ? "default" : "secondary"}>
                {x.status === "aktif" ? "Aktif" : "Selesai"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {x.tanggal_mulai || "—"}
              {x.tanggal_selesai ? ` – ${x.tanggal_selesai}` : ""}
            </TableCell>
            <TableCell>
              {x.link_daftar ? (
                <a
                  href={x.link_daftar}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Link
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
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
