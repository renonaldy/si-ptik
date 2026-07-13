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
import type { Pendaftaran } from "@/lib/api/pendaftaranApi";

interface PendaftaranTableProps {
  data: Pendaftaran[];
  canManage: boolean;
  onEdit: (x: Pendaftaran) => void;
  onDelete: (x: Pendaftaran) => void;
}

export function PendaftaranTable({ data, canManage, onEdit, onDelete }: PendaftaranTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>No. HP</TableHead>
          <TableHead>Asal Sekolah</TableHead>
          <TableHead>Jenis</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                <InitialsAvatar name={x.nama} />
                <span className="font-medium text-foreground">{x.nama}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{x.email || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.no_hp || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.asal_sekolah || "—"}</TableCell>
            <TableCell>
              {x.jenis ? <Badge variant="secondary">{x.jenis}</Badge> : <span className="text-muted-foreground">—</span>}
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
