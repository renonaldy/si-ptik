import { Pencil, Trash2, Check, X } from "lucide-react";
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
import type { Microsoft, MicrosoftStatus } from "@/lib/api/microsoftApi";

interface MicrosoftTableProps {
  data: Microsoft[];
  canManage: boolean;
  /** Approve/reject is limited to admin & super_admin (not per-menu write grants). */
  canApprove: boolean;
  onEdit: (x: Microsoft) => void;
  onDelete: (x: Microsoft) => void;
  onSetStatus: (x: Microsoft, status: MicrosoftStatus) => void;
}

const STATUS_META: Record<MicrosoftStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  approved: { label: "Disetujui", variant: "default" },
  pending: { label: "Menunggu", variant: "secondary" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

export function MicrosoftTable({ data, canManage, canApprove, onEdit, onDelete, onSetStatus }: MicrosoftTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>NPM</TableHead>
          <TableHead>Jenis Pelatihan</TableHead>
          <TableHead>Bukti</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell className="text-muted-foreground">{x.npm || "—"}</TableCell>
            <TableCell>
              {x.jenis_pelatihan ? <Badge variant="secondary">{x.jenis_pelatihan}</Badge> : <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell>
              {x.bukti_pembayaran ? (
                <a
                  href={x.bukti_pembayaran}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Lihat
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_META[x.status]?.variant ?? "secondary"}>
                {STATUS_META[x.status]?.label ?? x.status}
              </Badge>
            </TableCell>
            {canManage && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  {canApprove && x.status !== "approved" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400" onClick={() => onSetStatus(x, "approved")} title="Setujui">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {canApprove && x.status !== "rejected" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 dark:text-amber-400" onClick={() => onSetStatus(x, "rejected")} title="Tolak">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
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
