import { useEffect, useMemo, useState } from "react";
import { Plus, ClipboardCheck } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { UjianTable } from "@/components/ujian/UjianTable";
import { UjianFormDialog } from "@/components/ujian/UjianFormDialog";
import { useUjianList, useCreateUjian, useUpdateUjian, useDeleteUjian } from "@/features/ujian/hooks/useUjian";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { useMinuteTick } from "@/hooks/useMinuteTick";
import { accentStyle } from "@/lib/moduleColors";
import type { Ujian, UjianInput } from "@/lib/api/ujianApi";

const PAGE_SIZE = 10;

export default function UjianPage() {
  useMinuteTick();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ujian | null>(null);

  const manage = useCanWrite("ujian");

  const { data: rows = [], isLoading } = useUjianList(search);
  const createMut = useCreateUjian();
  const updateMut = useUpdateUjian();
  const deleteMut = useDeleteUjian();

  useEffect(() => {
    setPage(1);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (x: Ujian) => {
    setEditing(x);
    setDialogOpen(true);
  };

  const handleSubmit = (input: UjianInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Ujian) => {
    if (window.confirm("Hapus jadwal ujian ini?")) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Jadwal Ujian">
      <ListHeader
        accentKey="ujian"
        icon={ClipboardCheck}
        title="Jadwal Ujian"
        description="Kelola jadwal & status ujian (Sempro / Kompre) untuk halaman Akademik."
        count={rows.length}
        countLabel="Total Jadwal"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Jadwal
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("ujian")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
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
            title={search ? "Tidak ada data yang cocok" : "Belum ada jadwal ujian"}
            description={search ? "Coba kata kunci lain." : manage ? "Klik Tambah untuk membuat jadwal." : "Data akan tampil di sini."}
          />
        ) : (
          <>
            <UjianTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <UjianFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
