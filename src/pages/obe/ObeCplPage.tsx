import { useState } from "react";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { CplFormDialog } from "@/components/obe/CplFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useCpl, useCreateCpl, useUpdateCpl, useDeleteCpl } from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { kategoriLabel, type CPL, type CPLInput } from "@/lib/api/obeApi";

export default function ObeCplPage() {
  const manage = useCanWrite("obe");
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data: rows = [], isLoading } = useCpl(curriculumId);
  const createMut = useCreateCpl();
  const updateMut = useUpdateCpl();
  const deleteMut = useDeleteCpl();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CPL | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (x: CPL) => {
    setEditing(x);
    setDialogOpen(true);
  };
  const handleSubmit = (input: CPLInput) => {
    if (editing) updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    else createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
  };
  const handleDelete = (x: CPL) => {
    if (window.confirm(`Hapus CPL "${x.kode || x.deskripsi.slice(0, 30)}"?`)) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="CPL">
      <ListHeader
        accentKey="obe"
        icon={Target}
        title="Capaian Pembelajaran Lulusan"
        description="Kelola CPL per kurikulum (Sikap, Pengetahuan, Keterampilan)."
        count={rows.length}
        countLabel="Total CPL"
      >
        {manage && (
          <Button onClick={openCreate} disabled={!curriculumId}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah CPL
          </Button>
        )}
      </ListHeader>

      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border bg-muted/30 p-4">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} className="max-w-md" />
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={curriculumId ? "Belum ada CPL" : "Pilih kurikulum"}
            description={curriculumId ? (manage ? "Klik Tambah CPL untuk membuat yang pertama." : "Data akan tampil di sini.") : "Buat kurikulum terlebih dahulu di menu Kurikulum."}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Kode</TableHead>
                <TableHead className="w-44">Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                {manage && <TableHead className="w-[1%] text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((x) => (
                <TableRow key={x.id} className="group">
                  <TableCell className="font-medium text-foreground">{x.kode || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{kategoriLabel(x.kategori)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{x.deskripsi}</TableCell>
                  {manage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(x)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(x)} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {curriculumId && (
        <CplFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          curriculumId={curriculumId}
          onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending}
        />
      )}
    </AppLayout>
  );
}
