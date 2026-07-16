import { useMemo } from "react";
import { Grid3x3 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useMapping, useSetMapping } from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";

export default function ObeMappingPage() {
  const manage = useCanWrite("obe");
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const { data, isLoading } = useMapping(curriculumId);
  const setMut = useSetMapping();

  const cpls = data?.cpls ?? [];
  const cpmks = data?.cpmks ?? [];
  const linked = useMemo(() => new Set((data?.links ?? []).map((l) => `${l.cpl_id}|${l.cpmk_id}`)), [data]);

  const toggle = (cplId: string, cpmkId: string) => {
    if (!manage) return;
    setMut.mutate({ cpl_id: cplId, cpmk_id: cpmkId, linked: !linked.has(`${cplId}|${cpmkId}`) });
  };

  const hasData = cpls.length > 0 && cpmks.length > 0;

  return (
    <AppLayout title="Mapping CPL–CPMK" fluid>
      <ListHeader
        accentKey="obe"
        icon={Grid3x3}
        title="Pemetaan CPL – CPMK"
        description="Tandai CPMK mana yang mendukung setiap CPL (relasi many-to-many)."
        count={linked.size}
        countLabel="Relasi"
      />

      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border bg-muted/30 p-4">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} className="max-w-md" />
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !hasData ? (
          <EmptyState
            title="Data belum lengkap"
            description="Tambahkan minimal satu CPL dan satu CPMK terlebih dahulu untuk membangun matriks."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 min-w-[220px] border-b border-r border-border bg-muted/40 p-3 text-left font-semibold text-foreground">
                    CPMK \ CPL
                  </th>
                  {cpls.map((cpl) => (
                    <th key={cpl.id} className="border-b border-border p-2 text-center font-semibold text-foreground" title={cpl.deskripsi}>
                      {cpl.kode || "CPL"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cpmks.map((cpmk) => (
                  <tr key={cpmk.id} className="hover:bg-muted/20">
                    <td className="sticky left-0 z-10 border-b border-r border-border bg-card p-3 text-left" title={cpmk.deskripsi}>
                      <span className="font-medium text-foreground">{cpmk.kode || "CPMK"}</span>
                      <span className="ml-1 text-muted-foreground">— {cpmk.deskripsi.slice(0, 40)}{cpmk.deskripsi.length > 40 ? "…" : ""}</span>
                    </td>
                    {cpls.map((cpl) => {
                      const on = linked.has(`${cpl.id}|${cpmk.id}`);
                      return (
                        <td key={cpl.id} className="border-b border-border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={!manage || setMut.isPending}
                            onChange={() => toggle(cpl.id, cpmk.id)}
                            className="h-4 w-4 cursor-pointer accent-[hsl(var(--ma))] disabled:cursor-not-allowed"
                            aria-label={`${cpmk.kode || "CPMK"} mendukung ${cpl.kode || "CPL"}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!manage && hasData && (
        <p className="text-xs text-muted-foreground">Anda hanya dapat melihat matriks ini (mode baca).</p>
      )}
    </AppLayout>
  );
}
