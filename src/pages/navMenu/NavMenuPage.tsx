import { useState } from "react";
import { Navigation, Plus } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavMenuTable } from "@/components/navMenu/NavMenuTable";
import { NavMenuFormDialog } from "@/components/navMenu/NavMenuFormDialog";
import {
  useNavMenuList,
  useCreateNavMenuItem,
  useUpdateNavMenuItem,
  useDeleteNavMenuItem,
  useReorderNavMenu,
} from "@/features/navMenu/hooks/useNavMenu";
import type { NavMenuItem, NavMenuInput } from "@/lib/api/navMenuApi";

export default function NavMenuPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NavMenuItem | null>(null);

  const { data: rows = [], isLoading } = useNavMenuList();
  const createMut = useCreateNavMenuItem();
  const updateMut = useUpdateNavMenuItem();
  const deleteMut = useDeleteNavMenuItem();
  const reorderMut = useReorderNavMenu();

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (x: NavMenuItem) => { setEditing(x); setDialogOpen(true); };

  const handleSubmit = (input: NavMenuInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: NavMenuItem) => {
    if (window.confirm(`Hapus menu "${x.label}"?`)) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Menu Navigasi">
      <div className="card-hairline relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Menu Navigasi</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Atur menu yang tampil di navbar situs publik, termasuk sub-menu dropdown.
              </p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Menu
          </Button>
        </div>
      </div>

      <div className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Belum ada menu" description='Klik "Tambah Menu" untuk membuat menu pertama.' />
        ) : (
          <NavMenuTable
            data={rows}
            canManage
            onEdit={openEdit}
            onDelete={handleDelete}
            onReorder={(ids) => reorderMut.mutate(ids)}
          />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Perubahan di sini langsung tampil di navbar situs publik tanpa perlu deploy ulang.
      </p>

      <NavMenuFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
