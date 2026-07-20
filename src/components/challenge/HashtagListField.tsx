import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HashtagListFieldProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

// Repeatable plain-string row editor for the hashtag list ("Wajib Pakai Hashtag").
export function HashtagListField({ label, value, onChange }: HashtagListFieldProps) {
  const update = (i: number, tag: string) => onChange(value.map((t, idx) => (idx === i ? tag : t)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, ""]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Hashtag
        </Button>
      </div>
      {value.length === 0 && <p className="text-xs text-muted-foreground">Belum ada hashtag.</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <div key={i} className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1 pl-2.5">
              <span className="text-sm text-muted-foreground">#</span>
              <Input
                value={tag.replace(/^#/, "")}
                onChange={(e) => update(i, e.target.value)}
                placeholder="NamaHashtag"
                className="h-8 w-40 border-none bg-transparent px-1 shadow-none focus-visible:ring-0"
              />
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => remove(i)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
