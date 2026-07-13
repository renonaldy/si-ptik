import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Galeri } from "@/lib/api/galeriApi";

interface GaleriTableProps {
  data: Galeri[];
  canManage: boolean;
  onEdit: (x: Galeri) => void;
  onDelete: (x: Galeri) => void;
}

export function GaleriTable({ data, canManage, onEdit, onDelete }: GaleriTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Keterangan</TableHead>
          <TableHead>Tanggal</TableHead>
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
            <TableCell className="text-muted-foreground">{x.keterangan || "—"}</TableCell>
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
