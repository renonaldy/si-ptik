import { Pencil, Trash2, KeyRound } from "lucide-react";

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
import { roleLabel, canManageAccount, ROLES } from "@/features/auth/permissions";
import type { User } from "@/lib/api/usersApi";

interface UserTableProps {
  data: User[];
  actorRole?: string;
  meId?: string;
  onEdit: (u: User) => void;
  onResetPassword: (u: User) => void;
  onDelete: (u: User) => void;
}

function roleVariant(role: string): "default" | "secondary" | "outline" {
  if (role === ROLES.SUPER_ADMIN) return "default";
  if (role === ROLES.ADMIN) return "secondary";
  return "outline";
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function UserTable({ data, actorRole, meId, onEdit, onResetPassword, onDelete }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email / NPM</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Dibuat</TableHead>
          <TableHead className="w-[1%] text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((u) => {
          const canManageThis = canManageAccount(actorRole, u.role);
          const isSelf = meId === u.id;
          return (
            <TableRow key={u.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={u.full_name} />
                  <span className="font-medium text-foreground">
                    {u.full_name}
                    {isSelf && <span className="ml-2 text-xs font-normal text-muted-foreground">(Anda)</span>}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge variant={roleVariant(u.role)}>{roleLabel(u.role)}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{fmtDate(u.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(u)}
                    disabled={!canManageThis}
                    title={canManageThis ? "Edit" : "Tidak dapat mengubah akun ini"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onResetPassword(u)}
                    disabled={!canManageThis}
                    title="Reset password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(u)}
                    disabled={!canManageThis || isSelf}
                    title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus"}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
