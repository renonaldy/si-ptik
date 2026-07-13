import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Download } from "@/lib/api/downloadApi";

interface DownloadTableProps {
  data: Download[];
  canManage: boolean;
  onEdit: (x: Download) => void;
  onDelete: (x: Download) => void;
}

export function DownloadTable({ data, canManage, onEdit, onDelete }: DownloadTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Kategori</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                <InitialsAvatar name={x.judul} />
                <span className="font-medium text-foreground">{x.judul}</span>
              </div>
            </TableCell>
            <TableCell>
              {x.kategori ? <Badge variant="secondary">{x.kategori}</Badge> : <span className="text-muted-foreground">—</span>}
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
