import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, Save, Home, Compass, GraduationCap, Lightbulb, Phone } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { listContent, saveContent, type ContentItem } from "@/lib/api/contentApi";

type Field = { key: string; label: string; kind: "input" | "textarea"; hint?: string };
type Group = { heading: string; icon: typeof Home; fields: Field[] };

const GROUPS: Group[] = [
  {
    heading: "Beranda",
    icon: Home,
    fields: [
      { key: "home_badge", label: "Badge", kind: "input" },
      { key: "home_hero_title", label: "Judul Hero", kind: "input" },
      { key: "home_hero_subtitle", label: "Subjudul Hero", kind: "textarea" },
      { key: "home_stat1_value", label: "Statistik 1 — Angka", kind: "input" },
      { key: "home_stat1_label", label: "Statistik 1 — Label", kind: "input" },
      { key: "home_stat2_value", label: "Statistik 2 — Angka", kind: "input" },
      { key: "home_stat2_label", label: "Statistik 2 — Label", kind: "input" },
      { key: "home_stat3_value", label: "Statistik 3 — Angka", kind: "input" },
      { key: "home_stat3_label", label: "Statistik 3 — Label", kind: "input" },
      { key: "home_stat4_value", label: "Statistik 4 — Angka", kind: "input" },
      { key: "home_stat4_label", label: "Statistik 4 — Label", kind: "input" },
    ],
  },
  {
    heading: "Visi & Misi",
    icon: Compass,
    fields: [
      { key: "visi", label: "Visi", kind: "textarea" },
      { key: "misi", label: "Misi", kind: "textarea", hint: "Satu poin misi per baris." },
      { key: "tujuan", label: "Tujuan", kind: "textarea", hint: "Satu poin tujuan per baris." },
    ],
  },
  {
    heading: "Akademik",
    icon: GraduationCap,
    fields: [
      { key: "akademik_jenjang", label: "Jenjang", kind: "input" },
      { key: "akademik_sks", label: "Total SKS", kind: "input" },
      { key: "akademik_masa", label: "Masa Studi", kind: "input" },
    ],
  },
  {
    heading: "Kewirausahaan",
    icon: Lightbulb,
    fields: [{ key: "kewirausahaan_intro", label: "Deskripsi Singkat", kind: "textarea" }],
  },
  {
    heading: "Kontak",
    icon: Phone,
    fields: [
      { key: "kontak_title", label: "Judul Halaman", kind: "input" },
      { key: "kontak_subtitle", label: "Subjudul Halaman", kind: "input" },
      { key: "kontak_alamat", label: "Alamat", kind: "input" },
      { key: "kontak_email", label: "Email", kind: "input" },
      { key: "kontak_telepon", label: "Telepon", kind: "input" },
      { key: "kontak_jam", label: "Jam Layanan", kind: "input" },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

export default function PengaturanSitusPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const manage = canManage(me?.role);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data = [], isLoading } = useQuery({ queryKey: ["content"], queryFn: listContent });

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const c of data) map[c.key] = c.value;
    setForm(map);
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const items: ContentItem[] = ALL_KEYS.map((key) => ({ key, value: form[key] ?? "" }));
      return saveContent(items);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["public", "content"] });
      toast.success("Pengaturan situs disimpan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan"),
  });

  const setVal = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <AppLayout title="Pengaturan Situs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Pengaturan Situs</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Kelola konten halaman publik program studi.</p>
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
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <section key={g.heading} className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-5 flex items-center gap-2.5">
                <g.icon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">{g.heading}</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <div key={f.key} className={f.kind === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    {f.kind === "textarea" ? (
                      <Textarea id={f.key} value={form[f.key] ?? ""} onChange={(e) => setVal(f.key, e.target.value)} disabled={!manage} className="min-h-[100px]" />
                    ) : (
                      <Input id={f.key} value={form[f.key] ?? ""} onChange={(e) => setVal(f.key, e.target.value)} disabled={!manage} />
                    )}
                    {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}

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
