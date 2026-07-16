import { useEffect, useMemo, useState } from "react";
import { Plus, Megaphone } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { PromosiTable } from "@/components/promosi/PromosiTable";
import { PromosiFormDialog } from "@/components/promosi/PromosiFormDialog";
import {
  usePromosiList,
  useCreatePromosi,
  useUpdatePromosi,
  useDeletePromosi,
} from "@/features/promosi/hooks/usePromosi";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { cn } from "@/lib/utils";
import type { Promosi, PromosiInput, PromosiTipe } from "@/lib/api/promosiApi";

const PAGE_SIZE = 10;

const TIPE_FILTERS: { value: PromosiTipe | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "flyer", label: "Flyer" },
  { value: "video", label: "Video" },
];

export default function PromosiPage() {
  const [search, setSearch] = useState("");
  const [tipe, setTipe] = useState<PromosiTipe | "">("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promosi | null>(null);

  const manage = useCanWrite("promosi");

  const { data: rows = [], isLoading } = usePromosiList(search, tipe);
  const createMut = useCreatePromosi();
  const updateMut = useUpdatePromosi();
  const deleteMut = useDeletePromosi();

  useEffect(() => { setPage(1); }, [search, tipe]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (x: Promosi) => { setEditing(x); setDialogOpen(true); };

  const handleSubmit = (input: PromosiInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Promosi) => {
    if (window.confirm("Hapus data ini?")) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Promosi">
      <ListHeader
        accentKey="promosi"
        icon={Megaphone}
        title="Promosi"
        description="Kelola flyer dan video promosi untuk situs publik program studi."
        count={rows.length}
        countLabel="Total Promosi"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Promosi
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("promosi")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Cari judul…" />
            <div className="flex w-fit rounded-lg border border-border bg-background p-0.5">
              {TIPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTipe(f.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tipe === f.value ? "bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))]" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
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
            <PromosiTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <PromosiFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
