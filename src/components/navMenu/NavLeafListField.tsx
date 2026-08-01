import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NavLeaf } from "@/lib/api/navMenuApi";

interface NavLeafListFieldProps {
  value: NavLeaf[];
  onChange: (items: NavLeaf[]) => void;
}

// Repeatable {label, to, external} row editor for a dropdown menu's children.
export function NavLeafListField({ value, onChange }: NavLeafListFieldProps) {
  const update = (i: number, patch: Partial<NavLeaf>) =>
    onChange(value.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { label: "", to: "", external: false }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Sub-menu</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Sub-menu
        </Button>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">Belum ada sub-menu. Klik "Tambah Sub-menu" untuk menambahkan.</p>
      )}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((l, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
              <div className="flex-1 space-y-1.5">
                <Input value={l.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" />
                <Input
                  value={l.to}
                  onChange={(e) => update(i, { to: e.target.value })}
                  placeholder="/path atau https://…"
                />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={l.external}
                    onChange={(e) => update(i, { external: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  Tautan eksternal (buka tab baru)
                </label>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
