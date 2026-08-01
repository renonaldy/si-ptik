import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/obe/NativeSelect";
import { NavLeafListField } from "@/components/navMenu/NavLeafListField";
import type { NavMenuItem, NavMenuInput } from "@/lib/api/navMenuApi";

interface NavMenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: NavMenuItem | null;
  onSubmit: (input: NavMenuInput) => void;
  isPending: boolean;
}

const EMPTY: NavMenuInput = {
  type: "link",
  label: "",
  path: "",
  external: false,
  items: [],
};

function toInput(x: NavMenuItem): NavMenuInput {
  const { id, order_index, created_at, updated_at, ...rest } = x;
  return rest;
}

export function NavMenuFormDialog({ open, onOpenChange, initial, onSubmit, isPending }: NavMenuFormDialogProps) {
  const [form, setForm] = useState<NavMenuInput>(EMPTY);

  useEffect(() => {
    if (open) setForm(initial ? toInput(initial) : EMPTY);
  }, [open, initial]);

  const isValid = form.label.trim() !== "" && (form.type === "dropdown" || form.path.trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {initial ? "Edit Menu" : "Tambah Menu"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {initial ? "Perbarui menu navbar ini." : "Tambahkan menu baru ke navbar situs publik."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[62vh] space-y-4 overflow-y-auto scrollbar-thin p-6">
            <div className="space-y-1.5">
              <Label htmlFor="label">
                Label<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Contoh: Berita"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Tipe Menu</Label>
              <NativeSelect
                id="type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NavMenuInput["type"] }))}
              >
                <option value="link">Link — mengarah ke satu halaman</option>
                <option value="dropdown">Dropdown — punya sub-menu</option>
              </NativeSelect>
            </div>

            {form.type === "link" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="path">
                    Path / URL<span className="text-destructive"> *</span>
                  </Label>
                  <Input
                    id="path"
                    value={form.path}
                    onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
                    placeholder="/berita atau https://…"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.external}
                    onChange={(e) => setForm((f) => ({ ...f, external: e.target.checked }))}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  Tautan eksternal (buka tab baru)
                </label>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="path">Path Aktif (opsional)</Label>
                  <Input
                    id="path"
                    value={form.path}
                    onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
                    placeholder="/akademik"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digunakan untuk menandai menu ini aktif saat pengunjung berada di halaman terkait.
                  </p>
                </div>
                <NavLeafListField
                  value={form.items}
                  onChange={(items) => setForm((f) => ({ ...f, items }))}
                />
              </>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !isValid}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
