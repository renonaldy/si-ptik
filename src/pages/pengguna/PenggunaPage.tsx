import { useEffect, useMemo, useState } from "react";
import { Plus, UserCog } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { UserTable } from "@/components/pengguna/UserTable";
import { UserFormDialog, type UserFormValue } from "@/components/pengguna/UserFormDialog";
import { ResetPasswordDialog } from "@/components/pengguna/ResetPasswordDialog";
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useResetPassword,
  useDeleteUser,
} from "@/features/users/hooks/useUsers";
import { useMe } from "@/features/auth/useMe";
import { assignableRoles } from "@/features/auth/permissions";
import type { User } from "@/lib/api/usersApi";

const PAGE_SIZE = 10;

export default function PenggunaPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);

  const { data: me } = useMe();
  const roles = assignableRoles(me?.role);

  const { data: rows = [], isLoading } = useUsersList(search);
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const resetMut = useResetPassword();
  const deleteMut = useDeleteUser();

  useEffect(() => {
    setPage(1);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleSubmit = (value: UserFormValue) => {
    if (editing) {
      updateMut.mutate(
        { id: editing.id, input: { email: value.email, full_name: value.full_name, role: value.role } },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMut.mutate(value, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleReset = (password: string) => {
    if (!resetting) return;
    resetMut.mutate({ id: resetting.id, password }, { onSuccess: () => setResetting(null) });
  };

  const handleDelete = (u: User) => {
    if (window.confirm(`Hapus akun "${u.full_name}"?`)) {
      deleteMut.mutate(u.id);
    }
  };

  return (
    <AppLayout title="Manajemen Pengguna">
      {/* Header */}
      <div className="card-hairline relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Manajemen Pengguna</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Buat dan kelola akun dosen &amp; mahasiswa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <div className="font-display text-2xl font-medium tabular-nums text-foreground">{rows.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Akun</div>
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Buat Akun
            </Button>
          </div>
        </div>
      </div>

      <div className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, email, atau NPM…" />
          <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {rows.length} akun
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={search ? "Tidak ada akun yang cocok" : "Belum ada akun"}
            description={search ? "Coba kata kunci lain." : "Klik Buat Akun untuk menambahkan akun pertama."}
          />
        ) : (
          <>
            <UserTable
              data={paged}
              actorRole={me?.role}
              meId={me?.id}
              onEdit={openEdit}
              onResetPassword={setResetting}
              onDelete={handleDelete}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        assignableRoles={roles}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />

      <ResetPasswordDialog
        open={!!resetting}
        onOpenChange={(o) => !o && setResetting(null)}
        user={resetting}
        onSubmit={handleReset}
        isPending={resetMut.isPending}
      />
    </AppLayout>
  );
}
