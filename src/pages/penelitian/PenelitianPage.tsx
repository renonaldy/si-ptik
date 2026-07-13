import { useEffect, useMemo, useState } from "react";
import { Plus, FlaskConical } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { PenelitianTable } from "@/components/penelitian/PenelitianTable";
import { PenelitianFormDialog } from "@/components/penelitian/PenelitianFormDialog";
import {
  usePenelitianList,
  useCreatePenelitian,
  useUpdatePenelitian,
  useDeletePenelitian,
} from "@/features/penelitian/hooks/usePenelitian";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { accentStyle } from "@/lib/moduleColors";
import type { Penelitian, PenelitianInput } from "@/lib/api/penelitianApi";

const PAGE_SIZE = 10;

export default function PenelitianPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Penelitian | null>(null);

  const { data: me } = useMe();
  const manage = canManage(me?.role);

  const { data: rows = [], isLoading } = usePenelitianList(search);
  const createMut = useCreatePenelitian();
  const updateMut = useUpdatePenelitian();
  const deleteMut = useDeletePenelitian();

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
    setDialogOpen(true);
  };
  const openEdit = (x: Penelitian) => {
    setEditing(x);
    setDialogOpen(true);
  };

  const handleSubmit = (input: PenelitianInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Penelitian) => {
    if (window.confirm("Hapus data ini?")) {
      deleteMut.mutate(x.id);
    }
  };

  return (
    <AppLayout title="Penelitian">
      <ListHeader
        accentKey="penelitian"
        icon={FlaskConical}
        title="Penelitian"
        description="Kelola data penelitian Program Studi PTIK."
        count={rows.length}
        countLabel="Total Penelitian"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Penelitian
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("penelitian")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari judul atau author…" />
          <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{rows.length} data</span>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={search ? "Tidak ada data yang cocok" : "Belum ada data"}
            description={search ? "Coba kata kunci lain." : manage ? "Klik Tambah untuk membuat data pertama." : "Data akan tampil di sini."}
          />
        ) : (
          <>
            <PenelitianTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <PenelitianFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
