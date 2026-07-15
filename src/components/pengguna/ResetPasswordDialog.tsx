import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

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
import type { User } from "@/lib/api/usersApi";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (password: string) => void;
  isPending: boolean;
}

export function ResetPasswordDialog({ open, onOpenChange, user, onSubmit, isPending }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const valid = password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary" />

        <div className="flex items-center gap-3 border-b border-border bg-primary/5 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">Reset Password</DialogTitle>
            <DialogDescription className="mt-0.5">
              Setel password baru untuk <span className="font-medium text-foreground">{user?.full_name}</span>.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-1.5 p-6">
            <Label htmlFor="reset-password">
              Password Baru<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              autoFocus
              required
            />
            <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !valid}>
              {isPending ? "Menyimpan…" : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
