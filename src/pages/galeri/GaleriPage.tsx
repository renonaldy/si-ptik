import { useEffect, useMemo, useState } from "react";
import { Plus, ImageIcon } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { GaleriTable } from "@/components/galeri/GaleriTable";
import { GaleriFormDialog } from "@/components/galeri/GaleriFormDialog";
import {
  useGaleriList,
  useCreateGaleri,
  useUpdateGaleri,
  useDeleteGaleri,
} from "@/features/galeri/hooks/useGaleri";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { accentStyle } from "@/lib/moduleColors";
import type { Galeri, GaleriInput } from "@/lib/api/galeriApi";

const PAGE_SIZE = 10;

export default function GaleriPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Galeri | null>(null);

  const { data: me } = useMe();
  const manage = canManage(me?.role);

  const { data: rows = [], isLoading } = useGaleriList(search);
  const createMut = useCreateGaleri();
  const updateMut = useUpdateGaleri();
  const deleteMut = useDeleteGaleri();

  useEffect(() => { setPage(1); }, [search]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (x: Galeri) => { setEditing(x); setDialogOpen(true); };

  const handleSubmit = (input: GaleriInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Galeri) => {
    if (window.confirm("Hapus data ini?")) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Galeri">
      <ListHeader
        accentKey="galeri"
        icon={ImageIcon}
        title="Galeri"
        description="Kelola galeri untuk situs publik program studi."
        count={rows.length}
        countLabel="Total Foto"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Foto
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("galeri")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari judul…" />
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
            <GaleriTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <GaleriFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
