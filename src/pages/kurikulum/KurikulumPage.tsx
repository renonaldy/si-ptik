import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookMarked, Save, Plus, Trash2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { listContent, saveContent, type ContentItem } from "@/lib/api/contentApi";
import { SEM_COUNT, KURIKULUM_SEED, parseCourses, type Course } from "@/pages/public/topicSections";

type SemState = { tema: string; rows: Course[] };
const emptyRow = (): Course => ({ kode: "", nama: "", teori: 0, praktek: 0 });

export default function KurikulumPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const manage = canManage(me?.role);
  const { data = [], isLoading } = useQuery({ queryKey: ["content"], queryFn: listContent });

  const [sems, setSems] = useState<Record<number, SemState>>({});
  const [active, setActive] = useState(1);

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const c of data) map[c.key] = c.value;
    const next: Record<number, SemState> = {};
    for (let n = 1; n <= SEM_COUNT; n++) {
      const raw = (map[`kurikulum_sem${n}`] ?? "").trim();
      const lines = raw ? raw.split("\n") : KURIKULUM_SEED[n]?.lines ?? [];
      next[n] = {
        tema: map[`kurikulum_sem${n}_tema`] ?? KURIKULUM_SEED[n]?.tema ?? "",
        rows: parseCourses(lines),
      };
    }
    setSems(next);
  }, [data]);

  const cur = sems[active] ?? { tema: "", rows: [] };
  const setCur = (patch: Partial<SemState>) => setSems((s) => ({ ...s, [active]: { ...cur, ...patch } }));
  const setRow = (i: number, patch: Partial<Course>) =>
    setCur({ rows: cur.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });

  const tT = cur.rows.reduce((a, r) => a + r.teori, 0);
  const tP = cur.rows.reduce((a, r) => a + r.praktek, 0);
  const count = (n: number) => sems[n]?.rows.filter((r) => r.nama.trim()).length ?? 0;

  const save = useMutation({
    mutationFn: () => {
      const items: ContentItem[] = [];
      for (let n = 1; n <= SEM_COUNT; n++) {
        const s = sems[n] ?? { tema: "", rows: [] };
        const lines = s.rows
          .filter((r) => r.nama.trim())
          .map((r) => `${r.kode} | ${r.nama} | ${r.teori} | ${r.praktek}`);
        items.push({ key: `kurikulum_sem${n}`, value: lines.join("\n") });
        items.push({ key: `kurikulum_sem${n}_tema`, value: s.tema });
      }
      return saveContent(items);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["public", "content"] });
      toast.success("Kurikulum disimpan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan"),
  });

  const numCell = "w-20 text-center";

  return (
    <AppLayout title="Kelola Kurikulum">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Kelola Kurikulum</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Kelola matakuliah per semester untuk halaman publik.</p>
          </div>
        </div>
        {manage && (
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="mr-1.5 h-4 w-4" /> {save.isPending ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Semester tabs */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: SEM_COUNT }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setActive(n)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                Semester {n}
                <span className={`rounded-full px-1.5 text-[11px] ${active === n ? "bg-primary/20" : "bg-muted"}`}>
                  {count(n)}
                </span>
              </button>
            ))}
          </div>

          <section className="card-hairline space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="space-y-1.5">
              <Label htmlFor="tema">Tema Semester {active} (opsional)</Label>
              <Input
                id="tema"
                value={cur.tema}
                onChange={(e) => setCur({ tema: e.target.value })}
                disabled={!manage}
                placeholder="mis. Fondasi Karakter & Dasar Informatika"
              />
            </div>

            {/* Course table editor */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                    <th className="w-10 px-3 py-2.5 text-center">#</th>
                    <th className="px-3 py-2.5">Kode</th>
                    <th className="px-3 py-2.5">Nama MK</th>
                    <th className={`${numCell} px-2 py-2.5`}>Teori</th>
                    <th className={`${numCell} px-2 py-2.5`}>Praktek</th>
                    <th className={`${numCell} px-2 py-2.5`}>Total</th>
                    <th className="w-12 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {cur.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Belum ada matakuliah. Klik “Tambah Matakuliah”.
                      </td>
                    </tr>
                  ) : (
                    cur.rows.map((r, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-center text-muted-foreground">{i + 1}</td>
                        <td className="px-2 py-2">
                          <Input value={r.kode} onChange={(e) => setRow(i, { kode: e.target.value })} disabled={!manage} className="h-9" />
                        </td>
                        <td className="px-2 py-2">
                          <Input value={r.nama} onChange={(e) => setRow(i, { nama: e.target.value })} disabled={!manage} className="h-9" />
                        </td>
                        <td className="px-1 py-2">
                          <Input type="number" min={0} value={r.teori} onChange={(e) => setRow(i, { teori: Number(e.target.value) || 0 })} disabled={!manage} className="h-9 text-center" />
                        </td>
                        <td className="px-1 py-2">
                          <Input type="number" min={0} value={r.praktek} onChange={(e) => setRow(i, { praktek: Number(e.target.value) || 0 })} disabled={!manage} className="h-9 text-center" />
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-foreground">{r.teori + r.praktek}</td>
                        <td className="px-2 py-2 text-center">
                          {manage && (
                            <button
                              onClick={() => setCur({ rows: cur.rows.filter((_, idx) => idx !== i) })}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Hapus baris"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {cur.rows.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border bg-muted/40 font-semibold text-foreground">
                      <td colSpan={3} className="px-3 py-2.5 text-right">Total</td>
                      <td className="px-2 py-2.5 text-center">{tT}</td>
                      <td className="px-2 py-2.5 text-center">{tP}</td>
                      <td className="px-2 py-2.5 text-center">{tT + tP}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {manage && (
              <Button variant="outline" onClick={() => setCur({ rows: [...cur.rows, emptyRow()] })}>
                <Plus className="mr-1.5 h-4 w-4" /> Tambah Matakuliah
              </Button>
            )}
          </section>

          {manage && (
            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
                <Save className="mr-1.5 h-4 w-4" /> {save.isPending ? "Menyimpan…" : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
