import { useMemo, useState } from "react";
import { Grid3x3 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { ListHeader } from "@/components/shared/ListHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CurriculumPicker } from "@/components/obe/CurriculumPicker";
import { useSelectedCurriculum } from "@/features/obe/hooks/useSelectedCurriculum";
import { useMapping, useSetMapping, useIkMapping, useSetIkMapping } from "@/features/obe/hooks/useObe";
import { useCanWrite } from "@/features/auth/useMenuPermissions";
import { accentStyle } from "@/lib/moduleColors";
import type { CPMK } from "@/lib/api/obeApi";

type Column = { id: string; kode: string; title: string };

// Shared checkbox matrix: rows = CPMK, columns = CPL or IK.
function MappingMatrix({
  columns,
  cpmks,
  linked,
  manage,
  pending,
  onToggle,
  colHeader,
}: {
  columns: Column[];
  cpmks: CPMK[];
  linked: Set<string>; // "colId|cpmkId"
  manage: boolean;
  pending: boolean;
  onToggle: (colId: string, cpmkId: string, next: boolean) => void;
  colHeader: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40">
            <th className="sticky left-0 z-10 min-w-[220px] border-b border-r border-border bg-muted/40 p-3 text-left font-semibold text-foreground">
              CPMK \ {colHeader}
            </th>
            {columns.map((c) => (
              <th key={c.id} className="border-b border-border p-2 text-center font-semibold text-foreground" title={c.title}>
                {c.kode || colHeader}
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
              {columns.map((c) => {
                const on = linked.has(`${c.id}|${cpmk.id}`);
                return (
                  <td key={c.id} className="border-b border-border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!manage || pending}
                      onChange={() => onToggle(c.id, cpmk.id, !on)}
                      className="h-4 w-4 cursor-pointer accent-[hsl(var(--ma))] disabled:cursor-not-allowed"
                      aria-label={`${cpmk.kode || "CPMK"} mendukung ${c.kode || colHeader}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ObeMappingPage() {
  const manage = useCanWrite("obe");
  const { curriculums, curriculumId, setCurriculumId } = useSelectedCurriculum();
  const [tab, setTab] = useState<"cpl" | "ik">("cpl");

  // CPL ↔ CPMK
  const { data: cplData, isLoading: cplLoading } = useMapping(curriculumId);
  const setCplMut = useSetMapping();
  const cplLinked = useMemo(
    () => new Set((cplData?.links ?? []).map((l) => `${l.cpl_id}|${l.cpmk_id}`)),
    [cplData],
  );

  // IK ↔ CPMK
  const { data: ikData, isLoading: ikLoading } = useIkMapping(curriculumId);
  const setIkMut = useSetIkMapping();
  const ikLinked = useMemo(
    () => new Set((ikData?.links ?? []).map((l) => `${l.ik_id}|${l.cpmk_id}`)),
    [ikData],
  );
  const cplKode = useMemo(() => new Map((ikData?.cpls ?? []).map((c) => [c.id, c.kode])), [ikData]);

  const isLoading = tab === "cpl" ? cplLoading : ikLoading;
  const linkCount = tab === "cpl" ? cplLinked.size : ikLinked.size;

  const cplColumns: Column[] = (cplData?.cpls ?? []).map((c) => ({ id: c.id, kode: c.kode, title: c.deskripsi }));
  const ikColumns: Column[] = (ikData?.iks ?? []).map((ik) => ({
    id: ik.id,
    kode: ik.kode,
    title: `${cplKode.get(ik.cpl_id) || "CPL"} · ${ik.deskripsi}`,
  }));

  const cpmks = tab === "cpl" ? cplData?.cpmks ?? [] : ikData?.cpmks ?? [];
  const columns = tab === "cpl" ? cplColumns : ikColumns;
  const hasData = columns.length > 0 && cpmks.length > 0;

  return (
    <AppLayout title="Mapping OBE" fluid>
      <ListHeader
        accentKey="obe"
        icon={Grid3x3}
        title="Pemetaan OBE"
        description="Tandai relasi CPL–CPMK dan IK–CPMK (many-to-many)."
        count={linkCount}
        countLabel="Relasi"
      />

      <div style={accentStyle("obe")} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-end sm:justify-between">
          <CurriculumPicker curriculums={curriculums} value={curriculumId} onChange={setCurriculumId} className="w-full sm:max-w-md" />
          <div className="flex gap-2">
            {([
              { key: "cpl", label: "CPL – CPMK" },
              { key: "ik", label: "IK – CPMK" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "border-[hsl(var(--ma))] bg-[hsl(var(--ma)/0.1)] text-[hsl(var(--ma))]"
                    : "border-border text-muted-foreground hover:border-[hsl(var(--ma)/0.4)] hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !hasData ? (
          <EmptyState
            title="Data belum lengkap"
            description={
              tab === "cpl"
                ? "Perlu minimal satu CPL dan satu CPMK untuk membangun matriks."
                : "Perlu minimal satu IK (menu Indikator Kinerja) dan satu CPMK."
            }
          />
        ) : tab === "cpl" ? (
          <MappingMatrix
            columns={columns}
            cpmks={cpmks}
            linked={cplLinked}
            manage={manage}
            pending={setCplMut.isPending}
            onToggle={(colId, cpmkId, next) => setCplMut.mutate({ cpl_id: colId, cpmk_id: cpmkId, linked: next })}
            colHeader="CPL"
          />
        ) : (
          <MappingMatrix
            columns={columns}
            cpmks={cpmks}
            linked={ikLinked}
            manage={manage}
            pending={setIkMut.isPending}
            onToggle={(colId, cpmkId, next) => setIkMut.mutate({ ik_id: colId, cpmk_id: cpmkId, linked: next })}
            colHeader="IK"
          />
        )}
      </div>
      {!manage && hasData && (
        <p className="text-xs text-muted-foreground">Anda hanya dapat melihat matriks ini (mode baca).</p>
      )}
    </AppLayout>
  );
}
