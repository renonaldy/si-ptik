import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessagesSquare, Save, Plus, Trash2, Quote, HelpCircle, ChevronDown } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/useMe";
import { canManage } from "@/features/auth/permissions";
import { listContent, saveContent } from "@/lib/api/contentApi";
import { parseTestimonials, parseFaqs, type Testimonial, type Faq } from "@/lib/homeContent";
import { cn } from "@/lib/utils";

export default function KontenBerandaPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const manage = canManage(me?.role);
  const { data = [], isLoading } = useQuery({ queryKey: ["content"], queryFn: listContent });

  const [tst, setTst] = useState<Testimonial[]>([]);
  const [faq, setFaq] = useState<Faq[]>([]);
  const [tOpen, setTOpen] = useState<Record<number, boolean>>({}); // collapsed by default
  const [fOpen, setFOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const c of data) map[c.key] = c.value;
    setTst(parseTestimonials(map["home_testimonials"] ?? ""));
    setFaq(parseFaqs(map["home_faq"] ?? ""));
  }, [data]);

  const setTRow = (i: number, patch: Partial<Testimonial>) => setTst((a) => a.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const setFRow = (i: number, patch: Partial<Faq>) => setFaq((a) => a.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const save = useMutation({
    mutationFn: () => {
      const t = tst.filter((x) => x.name.trim() && x.quote.trim());
      const f = faq.filter((x) => x.q.trim() && x.a.trim());
      return saveContent([
        { key: "home_testimonials", value: JSON.stringify(t) },
        { key: "home_faq", value: JSON.stringify(f) },
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content"] });
      qc.invalidateQueries({ queryKey: ["public", "content"] });
      toast.success("Konten beranda disimpan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan"),
  });

  const SaveBtn = ({ size }: { size?: "lg" }) =>
    manage ? (
      <Button onClick={() => save.mutate()} disabled={save.isPending} size={size}>
        <Save className="mr-1.5 h-4 w-4" /> {save.isPending ? "Menyimpan…" : "Simpan Perubahan"}
      </Button>
    ) : null;

  return (
    <AppLayout title="Testimoni & FAQ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">Testimoni & FAQ</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Kelola testimoni dan pertanyaan umum di halaman Beranda.</p>
          </div>
        </div>
        <SaveBtn />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Testimoni */}
          <section className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-2.5">
              <Quote className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">Testimoni</h2>
              <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{tst.length}</span>
            </div>

            <div className="space-y-4">
              {tst.length === 0 && <p className="text-sm text-muted-foreground">Belum ada testimoni.</p>}
              {tst.map((t, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => setTOpen((o) => ({ ...o, [i]: !o[i] }))}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", tOpen[i] && "rotate-180")} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{t.name || "Testimoni baru"}</span>
                        {t.role && <span className="block truncate text-xs text-muted-foreground">{t.role}</span>}
                      </span>
                    </button>
                    {manage && (
                      <button
                        onClick={() => setTst((a) => a.filter((_, idx) => idx !== i))}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {tOpen[i] && (
                    <div className="space-y-3 border-t border-border p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Nama</Label>
                          <Input value={t.name} onChange={(e) => setTRow(i, { name: e.target.value })} disabled={!manage} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Peran / Status</Label>
                          <Input value={t.role} onChange={(e) => setTRow(i, { role: e.target.value })} disabled={!manage} placeholder="mis. Alumni 2020" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kutipan</Label>
                        <Textarea value={t.quote} onChange={(e) => setTRow(i, { quote: e.target.value })} disabled={!manage} className="min-h-[70px]" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {manage && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setTOpen((o) => ({ ...o, [tst.length]: true }));
                  setTst((a) => [...a, { name: "", role: "", quote: "" }]);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Tambah Testimoni
              </Button>
            )}
          </section>

          {/* FAQ */}
          <section className="card-hairline rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground">Pertanyaan Umum (FAQ)</h2>
              <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{faq.length}</span>
            </div>

            <div className="space-y-4">
              {faq.length === 0 && <p className="text-sm text-muted-foreground">Belum ada FAQ.</p>}
              {faq.map((f, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => setFOpen((o) => ({ ...o, [i]: !o[i] }))}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", fOpen[i] && "rotate-180")} />
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">{f.q || "FAQ baru"}</span>
                    </button>
                    {manage && (
                      <button
                        onClick={() => setFaq((a) => a.filter((_, idx) => idx !== i))}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {fOpen[i] && (
                    <div className="space-y-3 border-t border-border p-4">
                      <div className="space-y-1.5">
                        <Label>Pertanyaan</Label>
                        <Input value={f.q} onChange={(e) => setFRow(i, { q: e.target.value })} disabled={!manage} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Jawaban</Label>
                        <Textarea value={f.a} onChange={(e) => setFRow(i, { a: e.target.value })} disabled={!manage} className="min-h-[80px]" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {manage && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setFOpen((o) => ({ ...o, [faq.length]: true }));
                  setFaq((a) => [...a, { q: "", a: "" }]);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Tambah FAQ
              </Button>
            )}
          </section>

          <div className="flex justify-end">
            <SaveBtn size="lg" />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
