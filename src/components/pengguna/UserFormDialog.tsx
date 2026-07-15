import { useEffect, useState } from "react";
import { UserCog } from "lucide-react";

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
import { roleLabel, type Role } from "@/features/auth/permissions";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/api/usersApi";

export interface UserFormValue {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: User | null;
  assignableRoles: Role[];
  onSubmit: (value: UserFormValue) => void;
  isPending: boolean;
}

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors ring-offset-background hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

export function UserFormDialog({
  open,
  onOpenChange,
  initial,
  assignableRoles,
  onSubmit,
  isPending,
}: UserFormDialogProps) {
  const isEdit = !!initial;
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(assignableRoles[0] ?? "");

  useEffect(() => {
    if (!open) return;
    setEmail(initial?.email ?? "");
    setFullName(initial?.full_name ?? "");
    setPassword("");
    setRole(initial?.role ?? assignableRoles[0] ?? "");
  }, [open, initial, assignableRoles]);

  // Mahasiswa log in with their NPM (digits); everyone else with an email.
  const isMahasiswa = role === "mahasiswa";
  const emailValid = /.+@.+\..+/.test(email.trim());
  const npmValid = /^\d{5,}$/.test(email.trim());
  const identifierValid = isMahasiswa ? npmValid : emailValid;
  const passwordValid = isEdit || password.length >= 8;
  const valid = fullName.trim() !== "" && role !== "" && identifierValid && passwordValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ email: email.trim(), password, full_name: fullName.trim(), role });
  };

  // On edit, allow keeping the current role even if it's outside the actor's
  // normal assignable set (defensive; backend still enforces the real rule).
  const roleOptions = isEdit && role && !assignableRoles.includes(role as Role)
    ? [role as Role, ...assignableRoles]
    : assignableRoles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary" />

        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-primary/5 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-medium tracking-[-0.01em]">
              {isEdit ? "Edit Akun" : "Buat Akun Baru"}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {isEdit ? "Perbarui data dan role akun." : "Buat akun dosen atau mahasiswa baru."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">
                Nama Lengkap<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="user-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email">
                {isMahasiswa ? "NPM" : "Email"}<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="user-email"
                type={isMahasiswa ? "text" : "email"}
                inputMode={isMahasiswa ? "numeric" : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isMahasiswa ? "1810013231009" : "nama@ptik.id"}
                required
              />
              {isMahasiswa ? (
                <p className="text-xs text-muted-foreground">
                  Mahasiswa login memakai NPM (hanya angka){isEdit && ", dan bisa diubah di sini"}.
                </p>
              ) : (
                isEdit && (
                  <p className="text-xs text-muted-foreground">
                    Mengubah email juga mengubah email untuk login akun ini.
                  </p>
                )
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-role">
                Role<span className="text-destructive"> *</span>
              </Label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectClass}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </div>

            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="user-password">
                  Password<span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                />
                <p className={cn("text-xs", password && password.length < 8 ? "text-destructive" : "text-muted-foreground")}>
                  Minimal 8 karakter.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border bg-muted/20 p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !valid}>
              {isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
