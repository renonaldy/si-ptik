import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChallengePoint } from "@/lib/api/challengeApi";

interface PointListFieldProps {
  label: string;
  addLabel?: string;
  iconPlaceholder?: string;
  judulPlaceholder?: string;
  keteranganPlaceholder?: string;
  value: ChallengePoint[];
  onChange: (points: ChallengePoint[]) => void;
}

// Repeatable {icon, judul, keterangan} row editor — shared by the Tema,
// Aturan, Penilaian, and Hadiah sections of the Challenge form.
export function PointListField({
  label,
  addLabel = "Tambah Poin",
  iconPlaceholder = "🔥",
  judulPlaceholder = "Judul",
  keteranganPlaceholder = "Keterangan (opsional)",
  value,
  onChange,
}: PointListFieldProps) {
  const update = (i: number, patch: Partial<ChallengePoint>) =>
    onChange(value.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { icon: "", judul: "", keterangan: "" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-3.5 w-3.5" /> {addLabel}
        </Button>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">Belum ada poin. Klik "{addLabel}" untuk menambahkan.</p>
      )}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((p, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
              <Input
                value={p.icon}
                onChange={(e) => update(i, { icon: e.target.value })}
                placeholder={iconPlaceholder}
                className="w-14 shrink-0 text-center"
              />
              <div className="flex-1 space-y-1.5">
                <Input value={p.judul} onChange={(e) => update(i, { judul: e.target.value })} placeholder={judulPlaceholder} />
                <Input
                  value={p.keterangan}
                  onChange={(e) => update(i, { keterangan: e.target.value })}
                  placeholder={keteranganPlaceholder}
                />
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
