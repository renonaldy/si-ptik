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
import type { Ujian } from "@/lib/api/ujianApi";
import { JenisBadge, StatusBadge, effectiveStatus } from "./UjianBadges";

interface UjianTableProps {
  data: Ujian[];
  canManage: boolean;
  onEdit: (x: Ujian) => void;
  onDelete: (x: Ujian) => void;
}

export function UjianTable({ data, canManage, onEdit, onDelete }: UjianTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>NPM</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Ruang</TableHead>
          <TableHead>Status</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              <div className="flex items-center gap-3">
                {x.foto ? (
                  <img src={x.foto} alt={x.nama} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border" />
                ) : (
                  <InitialsAvatar name={x.nama} />
                )}
                <span className="font-medium text-foreground">{x.nama}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{x.npm || "—"}</TableCell>
            <TableCell><JenisBadge jenis={x.jenis} /></TableCell>
            <TableCell className="text-muted-foreground">
              {x.tanggal || "—"}
              {x.jam && <span className="text-xs"> · {x.jam}{x.jam_selesai ? `–${x.jam_selesai}` : ""}</span>}
            </TableCell>
            <TableCell className="text-muted-foreground">{x.ruang || "—"}</TableCell>
            <TableCell><StatusBadge status={effectiveStatus(x)} /></TableCell>
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
