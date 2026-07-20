import { useEffect, useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ListHeader } from "@/components/shared/ListHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ChallengeTable } from "@/components/challenge/ChallengeTable";
import { ChallengeFormDialog } from "@/components/challenge/ChallengeFormDialog";
import {
  useChallengeList,
  useCreateChallenge,
  useUpdateChallenge,
  useDeleteChallenge,
} from "@/features/challenge/hooks/useChallenge";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { cn } from "@/lib/utils";
import type { Challenge, ChallengeInput, ChallengeStatus } from "@/lib/api/challengeApi";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: ChallengeStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
];

export default function ChallengePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ChallengeStatus | "">("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);

  const manage = useCanWrite("challenge");

  const { data: rows = [], isLoading } = useChallengeList(search, status);
  const createMut = useCreateChallenge();
  const updateMut = useUpdateChallenge();
  const deleteMut = useDeleteChallenge();

  useEffect(() => { setPage(1); }, [search, status]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (x: Challenge) => { setEditing(x); setDialogOpen(true); };

  const handleSubmit = (input: ChallengeInput) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (x: Challenge) => {
    if (window.confirm("Hapus data ini?")) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Challenge">
      <ListHeader
        accentKey="challenge"
        icon={Trophy}
        title="Challenge"
        description="Kelola challenge/kompetisi untuk situs publik program studi."
        count={rows.length}
        countLabel="Total Challenge"
      >
        {manage && (
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Challenge
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("challenge")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Cari judul…" />
            <div className="flex w-fit rounded-lg border border-border bg-background p-0.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatus(f.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    status === f.value ? "bg-[hsl(var(--ma)/0.14)] text-[hsl(var(--ma))]" : "text-muted-foreground hover:text-foreground",
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
            <ChallengeTable data={paged} canManage={manage} onEdit={openEdit} onDelete={handleDelete} />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>

      <ChallengeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
        isPending={createMut.isPending || updateMut.isPending}
      />
    </AppLayout>
  );
}
