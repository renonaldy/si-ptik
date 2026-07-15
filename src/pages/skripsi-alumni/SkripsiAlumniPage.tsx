import { useEffect, useMemo, useState } from "react";
import { Plus, BookMarked } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { SkripsiAlumniTable } from "@/components/skripsi-alumni/SkripsiAlumniTable";
import { SkripsiAlumniFormDialog } from "@/components/skripsi-alumni/SkripsiAlumniFormDialog";
import {
  useSkripsiAlumniList,
  useCreateSkripsiAlumni,
  useUpdateSkripsiAlumni,
  useDeleteSkripsiAlumni,
} from "@/features/skripsi-alumni/hooks/useSkripsiAlumni";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import type { SkripsiAlumni, SkripsiAlumniInput } from "@/lib/api/skripsiAlumniApi";

const PAGE_SIZE = 10;

export default function SkripsiAlumniPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SkripsiAlumni | null>(null);

  const manage = useCanWrite("skripsi-alumni");

  const { data: rows = [], isLoading } = useSkripsiAlumniList(search);
  const createMut = useCreateSkripsiAlumni();
  const updateMut = useUpdateSkripsiAlumni();
  const deleteMut = useDeleteSkripsiAlumni();

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
  const openEdit = (x: SkripsiAlumni) => {
    setEditing(x);
    setDialogOpen(true);
  };

  const handleSubmit = (input: SkripsiAlumniInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: SkripsiAlumni) => {
    if (window.confirm("Hapus data ini?")) {
      deleteMut.mutate(x.id);
    }
  };

  return (
    <AppLayout title="Skripsi Alumni">
      <ListHeader
        accentKey="skripsi-alumni"
        icon={BookMarked}
        title="Skripsi Alumni"
        description="Kelola data skripsi alumni Program Studi PTIK."
        count={rows.length}
        countLabel="Total Data"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Data
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("skripsi-alumni")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
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
            <SkripsiAlumniTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <SkripsiAlumniFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
