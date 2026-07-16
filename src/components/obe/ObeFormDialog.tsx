import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { accentStyle } from "@/lib/moduleColors";

interface ObeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  description: string;
  onSubmit: () => void;
  isPending: boolean;
  canSubmit?: boolean;
  children: ReactNode;
}

// Shared accented dialog shell for every OBE form (mirrors the domain form dialogs).
export function ObeFormDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  onSubmit,
  isPending,
  canSubmit = true,
  children,
}: ObeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle("obe")} className="max-w-2xl gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: "hsl(var(--ma))" }} />
        <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--ma)/0.05)] p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))] ring-1 ring-inset ring-[hsl(var(--ma)/0.2)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">{title}</DialogTitle>
            <DialogDescription className="mt-0.5">{description}</DialogDescription>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !isPending) onSubmit();
          }}
        >
          <div className="max-h-[62vh] space-y-4 overflow-y-auto scrollbar-thin p-6">{children}</div>
          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !canSubmit}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
