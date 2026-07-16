import { useMemo, useState } from "react";
import { Plus, Crosshair, Pencil, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { IndicatorFormDialog } from "@/components/obe/IndicatorFormDialog";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import {
  useCpl,
  useIndicators,
  useCreateIndicator,
  useUpdateIndicator,
  useDeleteIndicator,
} from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import { kategoriLabel, type Indicator, type IndicatorInput } from "@/lib/api/obeApi";

export default function ObeIkPage() {
  const manage = useCanWrite("obe");
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data: cpls = [] } = useCpl(curriculumId);
  const { data: iks = [], isLoading } = useIndicators({ curriculumId });
  const createMut = useCreateIndicator();
  const updateMut = useUpdateIndicator();
  const deleteMut = useDeleteIndicator();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Indicator | null>(null);
  const [dialogCplId, setDialogCplId] = useState<string | undefined>(undefined);

  const byCpl = useMemo(() => {
    const m = new Map<string, Indicator[]>();
    for (const ik of iks) m.set(ik.cpl_id, [...(m.get(ik.cpl_id) ?? []), ik]);
    return m;
  }, [iks]);

  const openCreate = (cplId?: string) => {
    setEditing(null);
    setDialogCplId(cplId);
    setDialogOpen(true);
  };
  const openEdit = (x: Indicator) => {
    setEditing(x);
    setDialogCplId(undefined);
    setDialogOpen(true);
  };
  const handleSubmit = (input: IndicatorInput) => {
    if (editing) updateMut.mutate({ id: editing.id, input }, { onSuccess: () => setDialogOpen(false) });
    else createMut.mutate(input, { onSuccess: () => setDialogOpen(false) });
  };
  const handleDelete = (x: Indicator) => {
    if (window.confirm(`Hapus IK "${x.kode || x.deskripsi.slice(0, 30)}"?`)) deleteMut.mutate(x.id);
  };

  return (
    <AppLayout title="Indikator Kinerja">
      <ListHeader
        accentKey="obe"
        icon={Crosshair}
        title="Indikator Kinerja (IK)"
        description="Turunan CPL yang menjadi acuan pengukuran ketercapaian."
        count={iks.length}
        countLabel="Total IK"
      >
        {manage && (
          <Button onClick={() => openCreate()} disabled={cpls.length === 0}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah IK
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
        ) : cpls.length === 0 ? (
          <EmptyState title="Belum ada CPL" description="Buat CPL terlebih dahulu di menu CPL — IK adalah turunan CPL." />
        ) : (
          <div className="divide-y divide-border">
            {cpls.map((cpl) => {
              const rows = byCpl.get(cpl.id) ?? [];
              return (
                <div key={cpl.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/20 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 rounded-md bg-[hsl(var(--ma)/0.12)] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--ma))]">
                        {cpl.kode || "CPL"}
                      </span>
                      <span className="truncate text-sm text-foreground">{cpl.deskripsi}</span>
                      <Badge variant="secondary" className="shrink-0">{kategoriLabel(cpl.kategori)}</Badge>
                    </div>
                    {manage && (
                      <Button size="sm" variant="ghost" className="text-primary" onClick={() => openCreate(cpl.id)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> IK
                      </Button>
                    )}
                  </div>
                  {rows.length === 0 ? (
                    <p className="px-6 py-3 text-sm text-muted-foreground">Belum ada IK untuk CPL ini.</p>
                  ) : (
                    <Table>
                      <TableBody>
                        {rows.map((ik) => (
                          <TableRow key={ik.id} className="group">
                            <TableCell className="w-28 pl-8 font-medium text-foreground">{ik.kode || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{ik.deskripsi}</TableCell>
                            {manage && (
                              <TableCell className="w-[1%] text-right">
                                <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ik)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(ik)} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Nilai ketercapaian IK dihitung dari CPMK yang dipetakan ke IK — atur di menu <span className="font-medium">Mapping</span> (tab IK–CPMK).
      </p>

      {cpls.length > 0 && (
        <IndicatorFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
          cpls={cpls}
          defaultCplId={dialogCplId}
          onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending}
        />
      )}
    </AppLayout>
  );
}
