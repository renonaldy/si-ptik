import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, Save, Home, Compass, GraduationCap, Lightbulb, Phone, Building2, ChevronDown, ShieldCheck } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { useMe } from "@/features/auth/useMe";
import { canManage, isSuperAdmin } from "@/features/auth/permissions";
import { listContent, saveContent, type ContentItem } from "@/lib/api/contentApi";
import { cn } from "@/lib/utils";

type Field = { key: string; label: string; kind: "input" | "textarea" | "upload"; hint?: string; accept?: string };
type Group = { heading: string; icon: typeof Home; fields: Field[] };

const GROUPS: Group[] = [
  {
    heading: "Beranda",
    icon: Home,
    fields: [
      { key: "home_badge", label: "Badge", kind: "input" },
      { key: "home_hero_title", label: "Judul Hero", kind: "input" },
      { key: "home_hero_subtitle", label: "Subjudul Hero", kind: "textarea" },
      { key: "home_video_url", label: "Video Profil", kind: "upload", accept: ".mp4,.webm,.ogg,.mov", hint: "Tempel link YouTube ATAU unggah file video (.mp4/.webm/.mov). Kosongkan bila belum ada — tombol menampilkan placeholder." },
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
    heading: "Profil (halaman Tentang)",
    icon: Building2,
    fields: [
      { key: "profil_sambutan_foto", label: "Foto Sambutan (Kaprodi)", kind: "upload", accept: ".png,.jpg,.jpeg,.webp", hint: "Unggah foto atau tempel URL." },
      { key: "profil_sambutan_nama", label: "Nama Pemberi Sambutan", kind: "input" },
      { key: "profil_sambutan_jabatan", label: "Jabatan", kind: "input" },
      { key: "profil_sambutan_teks", label: "Teks Sambutan", kind: "textarea", hint: "Satu paragraf per baris." },
      { key: "profil_deskripsi", label: "Deskripsi Program Studi", kind: "textarea", hint: "Satu paragraf per baris." },
      { key: "profil_logo", label: "Logo Program Studi", kind: "upload", accept: ".png,.jpg,.jpeg,.webp,.svg", hint: "Unggah logo atau tempel URL." },
      { key: "profil_logo_makna", label: "Makna Logo", kind: "textarea", hint: "Satu paragraf per baris." },
      { key: "profil_akreditasi_peringkat", label: "Akreditasi — Peringkat", kind: "input" },
      { key: "profil_akreditasi_lembaga", label: "Akreditasi — Lembaga", kind: "input", hint: "mis. BAN-PT / LAM Infokom" },
      { key: "profil_akreditasi_berlaku", label: "Akreditasi — Berlaku s.d.", kind: "input" },
      { key: "profil_akreditasi_sk", label: "Akreditasi — No. SK", kind: "input" },
      { key: "profil_akreditasi_teks", label: "Akreditasi — Keterangan", kind: "textarea" },
      { key: "profil_dosen_teks", label: "Dosen — Keterangan", kind: "textarea", hint: "Satu paragraf per baris." },
      { key: "profil_dosen_jumlah", label: "Dosen — Jumlah (mis. 25+)", kind: "input" },
      { key: "profil_lokasi_alamat", label: "Lokasi — Alamat", kind: "input" },
      { key: "profil_lokasi_maps", label: "Lokasi — URL Embed Google Maps", kind: "input", hint: "Ambil dari Google Maps → Bagikan → Sematkan peta (URL src)." },
      { key: "profil_ig", label: "Media Sosial — Instagram (URL)", kind: "input" },
      { key: "profil_fb", label: "Media Sosial — Facebook (URL)", kind: "input" },
      { key: "profil_yt", label: "Media Sosial — YouTube (URL)", kind: "input" },
      { key: "profil_web", label: "Media Sosial — Website (URL)", kind: "input" },
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
      { key: "akademik_kurikulum", label: "Kurikulum — Keterangan", kind: "textarea", hint: "Satu paragraf per baris." },
      { key: "akademik_profil_lulusan", label: "Profil Lulusan", kind: "textarea", hint: "Satu profil lulusan per baris." },
      { key: "akademik_prospek", label: "Prospek Kerja", kind: "textarea", hint: "Satu prospek kerja per baris." },
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
  const isSuper = isSuperAdmin(me?.role);
  const [form, setForm] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({}); // collapsed by default
  const [sysVer, setSysVer] = useState("");

  const { data = [], isLoading } = useQuery({ queryKey: ["content"], queryFn: listContent });

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const c of data) map[c.key] = c.value;
    setForm(map);
    setSysVer(map["system_version"] ?? "");
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

  // System version — isolated save, super admin only.
  const saveVer = useMutation({
    mutationFn: () => saveContent([{ key: "system_version", value: sysVer.trim() || "1.0" }]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["public", "content"] });
      toast.success("Versi sistem diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan"),
  });

  const setVal = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (heading: string) => setOpen((o) => ({ ...o, [heading]: !o[heading] }));

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
        <div className="space-y-4">
          {GROUPS.map((g) => (
            <section key={g.heading} className="card-hairline overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <button
                type="button"
                onClick={() => toggle(g.heading)}
                className="flex w-full items-center gap-2.5 p-5 text-left transition-colors hover:bg-muted/30"
              >
                <g.icon className="h-5 w-5 text-primary" />
                <h2 className="flex-1 font-display text-lg font-medium tracking-[-0.01em] text-foreground">{g.heading}</h2>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", open[g.heading] && "rotate-180")} />
              </button>
              {open[g.heading] && (
              <div className="grid grid-cols-1 gap-4 border-t border-border p-6 sm:grid-cols-2">
                {g.fields.map((f) =>
                  f.kind === "upload" ? (
                    <div key={f.key} className="sm:col-span-2">
                      {manage ? (
                        <FileUploadField
                          label={f.label}
                          value={form[f.key] ?? ""}
                          onChange={(url) => setVal(f.key, url)}
                          accept={f.accept}
                          hint={f.hint}
                        />
                      ) : (
                        <div className="space-y-1.5">
                          <Label>{f.label}</Label>
                          <Input value={form[f.key] ?? ""} disabled />
                          {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={f.key} className={f.kind === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                      <Label htmlFor={f.key}>{f.label}</Label>
                      {f.kind === "textarea" ? (
                        <Textarea id={f.key} value={form[f.key] ?? ""} onChange={(e) => setVal(f.key, e.target.value)} disabled={!manage} className="min-h-[100px]" />
                      ) : (
                        <Input id={f.key} value={form[f.key] ?? ""} onChange={(e) => setVal(f.key, e.target.value)} disabled={!manage} />
                      )}
                      {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                    </div>
                  ),
                )}
              </div>
              )}
            </section>
          ))}

          {manage && (
            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
                <Save className="mr-1.5 h-4 w-4" /> {save.isPending ? "Menyimpan…" : "Simpan Perubahan"}
              </Button>
            </div>
          )}

          {/* System version — super admin only */}
          {isSuper && (
            <section className="card-hairline rounded-2xl border border-primary/30 bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="flex-1 font-display text-lg font-medium tracking-[-0.01em] text-foreground">Sistem</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">Super Admin</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="system_version">Versi Sistem</Label>
                  <Input id="system_version" value={sysVer} onChange={(e) => setSysVer(e.target.value)} placeholder="1.0" />
                  <p className="text-xs text-muted-foreground">Tampil di sidebar Super Admin. Hanya Super Admin yang dapat mengubahnya.</p>
                </div>
                <Button onClick={() => saveVer.mutate()} disabled={saveVer.isPending}>
                  <Save className="mr-1.5 h-4 w-4" /> {saveVer.isPending ? "Menyimpan…" : "Simpan Versi"}
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
    </AppLayout>
  );
}
