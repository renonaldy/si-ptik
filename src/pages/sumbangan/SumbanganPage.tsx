import { useEffect, useMemo, useState } from "react";
import { Plus, HandCoins } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { SumbanganTable } from "@/components/sumbangan/SumbanganTable";
import { SumbanganFormDialog } from "@/components/sumbangan/SumbanganFormDialog";
import {
  useSumbanganList,
  useCreateSumbangan,
  useUpdateSumbangan,
  useDeleteSumbangan,
} from "@/features/sumbangan/hooks/useSumbangan";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { accentStyle } from "@/lib/moduleColors";
import type { Sumbangan, SumbanganInput } from "@/lib/api/sumbanganApi";

const PAGE_SIZE = 10;

export default function SumbanganPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sumbangan | null>(null);

  const { data: me } = useMe();
  const manage = canManage(me?.role);

  const { data: rows = [], isLoading } = useSumbanganList(search);
  const createMut = useCreateSumbangan();
  const updateMut = useUpdateSumbangan();
  const deleteMut = useDeleteSumbangan();

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
  const openEdit = (x: Sumbangan) => {
    setEditing(x);
    setDialogOpen(true);
  };

  const handleSubmit = (input: SumbanganInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Sumbangan) => {
    if (window.confirm("Hapus data ini?")) {
      deleteMut.mutate(x.id);
    }
  };

  return (
    <AppLayout title="Sumbangan Alumni">
      <ListHeader
        accentKey="sumbangan"
        icon={HandCoins}
        title="Sumbangan Alumni"
        description="Kelola data sumbangan alumni Program Studi PTIK."
        count={rows.length}
        countLabel="Total Sumbangan"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Sumbangan
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("sumbangan")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama atau NPM…" />
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
            <SumbanganTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <SumbanganFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
