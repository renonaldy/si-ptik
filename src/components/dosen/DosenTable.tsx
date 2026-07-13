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
import type { Dosen } from "@/lib/api/dosenApi";

interface DosenTableProps {
  data: Dosen[];
  canManage: boolean;
  onEdit: (x: Dosen) => void;
  onDelete: (x: Dosen) => void;
}

export function DosenTable({ data, canManage, onEdit, onDelete }: DosenTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Dosen</TableHead>
          <TableHead>NIDN</TableHead>
          <TableHead>Jabatan</TableHead>
          <TableHead>Pangkat</TableHead>
          <TableHead>No. HP</TableHead>
          <TableHead>Status</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                <InitialsAvatar name={x.nama_dosen} />
                <span className="font-medium text-foreground">{x.nama_dosen}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{x.nidn || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.jabatan || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.pangkat || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{x.no_hp || "—"}</TableCell>
            <TableCell>
              {x.status ? (
                <Badge variant={x.status.toLowerCase() === "aktif" ? "default" : "secondary"}>{x.status}</Badge>
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
