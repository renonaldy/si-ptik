import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowDown,
  CalendarDays,
  ExternalLink,
  FileText,
  CheckCircle2,
  BarChart3,
  Gift,
  Pencil,
  Copy,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { getChallengePublic } from "@/lib/api/publicApi";
import type { ChallengePoint } from "@/lib/api/challengeApi";

// This detail page intentionally uses its own navy/orange palette (matching a
// reference challenge landing page the department asked to mirror) instead of
// the site-wide violet/aurora theme — a deliberate one-off, not the default look.
const NAVY = "text-[#0f2847]";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className={`font-display text-3xl font-bold tracking-[-0.01em] md:text-4xl ${NAVY}`}>{children}</h2>
      <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-orange-500" />
    </div>
  );
}

function TemaCard({ p }: { p: ChallengePoint }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center text-3xl">{p.icon || "💡"}</div>
      <div className={`mt-3 font-bold ${NAVY}`}>{p.judul}</div>
      {p.keterangan && <div className="mt-1.5 text-sm text-slate-500">{p.keterangan}</div>}
    </div>
  );
}

function AturanCard({ p }: { p: ChallengePoint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{p.icon || "📌"}</span>
        <span className={`font-bold ${NAVY}`}>{p.judul}</span>
      </div>
      {p.keterangan && <p className="mt-2 text-sm text-slate-500">{p.keterangan}</p>}
    </div>
  );
}

const HADIAH_TIERS = [
  "border-yellow-400 bg-yellow-50/70",
  "border-slate-300 bg-slate-50",
  "border-orange-300 bg-orange-50/60",
];

export default function ChallengeDetailPage() {
  const { id = "" } = useParams();
  const { data: c, isLoading, isError } = useQuery({
    queryKey: ["public", "challenge", id],
    queryFn: () => getChallengePublic(id),
    enabled: !!id,
  });

  const copyCaption = async () => {
    if (!c?.caption_template) return;
    try {
      await navigator.clipboard.writeText(c.caption_template);
      toast.success("Caption disalin!");
    } catch {
      toast.error("Gagal menyalin caption");
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !c) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/challenge"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Challenge</Link>
          </Button>
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Challenge tidak ditemukan.
          </div>
        </div>
      </PublicLayout>
    );
  }

  const hasTema = c.tema.length > 0 || !!c.tema_subjudul;
  const hasAturan = c.aturan.length > 0;
  const hasHashtags = c.hashtags.length > 0;
  const hasCaption = !!c.caption_template;
  const hasAturanExtras = hasHashtags || hasCaption;
  const hasPenilaian = c.penilaian.length > 0;
  const hasHadiah = c.hadiah.length > 0;

  return (
    <PublicLayout>
      {/* Hero — solid navy gradient with a diagonal cut into the white content below */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-[#0a1f3d] via-[#0f3057] to-[#134074] pb-28 pt-16 text-white md:pb-36 md:pt-20"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
      >
        {c.poster && (
          <img src={c.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <Link
          to="/challenge"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white md:left-6 md:top-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Semua Challenge
        </Link>

        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-400">
            🔥 Challenge {c.status === "selesai" ? "· Selesai" : ""}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{c.judul}</h1>
          {(c.tanggal_mulai || c.tanggal_selesai) && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
              <CalendarDays className="h-3.5 w-3.5" />
              {c.tanggal_mulai || "—"}
              {c.tanggal_selesai ? ` – ${c.tanggal_selesai}` : ""}
            </div>
          )}
          {c.deskripsi && (
            <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-white/85">{c.deskripsi}</p>
          )}
          {c.link_daftar && (
            <a
              href="#daftar"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-900/30 transition hover:brightness-110"
            >
              Ikutan Sekarang <ArrowDown className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>

      {/* Tema */}
      {hasTema && (
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <SectionHeading>Tema Challenge</SectionHeading>
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              {c.tema_subjudul && (
                <div className="rounded-xl border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-6 text-center">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Tema Utama:</div>
                  <div className={`mt-1.5 font-display text-xl font-bold md:text-2xl ${NAVY}`}>"{c.tema_subjudul}"</div>
                </div>
              )}
              {c.tema.length > 0 && (
                <>
                  <p className="mt-6 text-center text-sm text-slate-500">
                    Kamu bebas mengeksplorasi cerita kamu, seperti beberapa poin seru ini:
                  </p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {c.tema.map((p, i) => (
                      <TemaCard key={i} p={p} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Aturan */}
      {(hasAturan || hasAturanExtras) && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <SectionHeading>Aturannya Simpel!</SectionHeading>

            {hasAturan && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.aturan.map((p, i) => (
                  <AturanCard key={i} p={p} />
                ))}
              </div>
            )}

            {hasAturanExtras && (
              <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-6 md:p-8">
                {hasHashtags && (
                  <div>
                    <div className={`flex items-center gap-2 font-bold ${NAVY}`}>
                      <span className="text-orange-500">#</span> Wajib Pakai Hashtag:
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.hashtags.map((tag, i) => (
                        <span key={i} className="rounded-full bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white">
                          #{tag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hasCaption && (
                  <div className={hasHashtags ? "mt-6" : ""}>
                    <div className={`flex items-center gap-2 font-bold ${NAVY}`}>
                      <Pencil className="h-4 w-4" /> Template Caption
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Salin atau modifikasi sesuai gaya bahasamu sendiri:</p>
                    <div className="relative mt-3 rounded-xl border-l-4 border-orange-400 bg-[#0f172a] p-4 pr-24">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">{c.caption_template}</p>
                      <button
                        type="button"
                        onClick={copyCaption}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                      >
                        <Copy className="h-3.5 w-3.5" /> Salin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Penilaian & Hadiah */}
      {(hasPenilaian || hasHadiah) && (
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <SectionHeading>Penilaian &amp; Hadiah</SectionHeading>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {hasPenilaian && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <div className={`flex items-center gap-2 font-display text-lg font-bold ${NAVY}`}>
                    <BarChart3 className="h-5 w-5" /> Kriteria Penilaian
                  </div>
                  {c.penilaian_intro && <p className="mt-3 text-sm text-slate-500">{c.penilaian_intro}</p>}
                  <div className="mt-4 space-y-2.5">
                    {c.penilaian.map((p, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span className="text-slate-600">
                          {p.judul}
                          {p.keterangan && <span> ({p.keterangan})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasHadiah && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <div className={`flex items-center gap-2 font-display text-lg font-bold ${NAVY}`}>
                    <Gift className="h-5 w-5" /> Hadiah Spesial
                  </div>
                  {c.hadiah_intro && <p className="mt-3 text-sm text-slate-500">{c.hadiah_intro}</p>}
                  <div className="mt-4 space-y-2.5">
                    {c.hadiah.map((p, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl border-l-4 p-3.5 ${HADIAH_TIERS[i] ?? "border-slate-200 bg-slate-50/60"}`}
                      >
                        <span className="text-2xl">{p.icon || "🏆"}</span>
                        <div>
                          <div className={`font-bold ${NAVY}`}>{p.judul}</div>
                          {p.keterangan && <div className="text-sm text-slate-500">{p.keterangan}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Registration CTA — anchor target for the hero button */}
      <section id="daftar" className="scroll-mt-16 bg-white py-16 text-center md:py-20">
        <div className="mx-auto max-w-xl px-4 md:px-6">
          <div className="text-3xl">🎥</div>
          <h2 className={`mt-3 font-display text-2xl font-bold md:text-3xl ${NAVY}`}>Yuk, tunjukkan yang terbaik dari dirimu!</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {c.link_daftar && (
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/20 hover:brightness-110"
              >
                <a href={c.link_daftar} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Ikutan Sekarang
                </a>
              </Button>
            )}
            {c.lampiran && (
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <a href={c.lampiran} target="_blank" rel="noreferrer">
                  <FileText className="mr-1.5 h-4 w-4" /> Unduh Panduan
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
