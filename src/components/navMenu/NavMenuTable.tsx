import { Pencil, Trash2, ArrowUp, ArrowDown, Link2, ChevronDown } from "lucide-react";
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
import type { NavMenuItem } from "@/lib/api/navMenuApi";

interface NavMenuTableProps {
  data: NavMenuItem[];
  canManage: boolean;
  onEdit: (x: NavMenuItem) => void;
  onDelete: (x: NavMenuItem) => void;
  onReorder: (ids: string[]) => void;
}

export function NavMenuTable({ data, canManage, onEdit, onDelete, onReorder }: NavMenuTableProps) {
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= data.length) return;
    const ids = data.map((x) => x.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(ids);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[1%]">Urutan</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Path</TableHead>
          {canManage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x, i) => (
          <TableRow key={x.id} className="group">
            <TableCell>
              {canManage ? (
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => move(i, -1)} title="Naikkan">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === data.length - 1} onClick={() => move(i, 1)} title="Turunkan">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              )}
            </TableCell>
            <TableCell>
              <div className="font-medium text-foreground">{x.label}</div>
            </TableCell>
            <TableCell>
              <Badge variant={x.type === "dropdown" ? "secondary" : "default"} className="gap-1">
                {x.type === "dropdown" ? <ChevronDown className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                {x.type === "dropdown" ? `Dropdown · ${x.items.length} sub-menu` : "Link"}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[16rem] truncate text-muted-foreground">{x.path || "—"}</TableCell>
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
