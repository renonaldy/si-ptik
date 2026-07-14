import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSiteContent } from "@/features/content/useSiteContent";

type Getter = (k: string, f?: string) => string;
type Link = { label: string; to: string };
type Reply = { text: string; links?: Link[] };
type Msg = { role: "bot" | "user"; text: string; links?: Link[] };

// Rule-based knowledge base. Answers pull live values from the site-content CMS,
// so they stay in sync with what admins edit.
const INTENTS: { keywords: string[]; reply: (get: Getter) => Reply }[] = [
  {
    keywords: ["daftar", "pendaftaran", "mendaftar", "pmb", "spmb", "masuk", "gabung"],
    reply: () => ({
      text: "Pendaftaran mahasiswa baru dilakukan online. Klik tombol di bawah untuk mengisi formulir — setelah terkirim Anda akan diarahkan ke halaman SPMB.",
      links: [{ label: "Formulir Pendaftaran", to: "/daftar" }],
    }),
  },
  {
    keywords: ["kurikulum", "mata kuliah", "matakuliah", "mk", "sks", "silabus"],
    reply: (get) => ({
      text: `Kurikulum ditempuh dalam ${get("akademik_masa", "8 semester")} dengan total ${get("akademik_sks", "144 SKS")}. Lihat daftar matakuliah tiap semester di halaman Kurikulum.`,
      links: [{ label: "Lihat Kurikulum", to: "/akademik/kurikulum" }],
    }),
  },
  {
    keywords: ["akademik", "jenjang", "lama kuliah", "masa studi", "berapa semester", "s1", "sarjana"],
    reply: (get) => ({
      text: `Program Studi PTIK jenjang ${get("akademik_jenjang", "Sarjana (S1)")}, total ${get("akademik_sks", "144 SKS")}, masa studi ${get("akademik_masa", "8 Semester")}.`,
      links: [{ label: "Info Akademik", to: "/akademik" }],
    }),
  },
  {
    keywords: ["ujian", "sempro", "kompre", "sidang", "seminar proposal", "jadwal ujian"],
    reply: () => ({
      text: "Jadwal dan status peserta ujian (Seminar Proposal & Komprehensif) bisa dilihat di halaman Kegiatan Ujian.",
      links: [{ label: "Kegiatan Ujian", to: "/akademik/ujian" }],
    }),
  },
  {
    keywords: ["lulusan", "profil lulusan", "prospek", "karir", "karier", "kerja", "peluang"],
    reply: () => ({
      text: "Lulusan PTIK siap berkarier sebagai pendidik TIK maupun profesional teknologi (software developer, IT consultant, technopreneur, dll).",
      links: [
        { label: "Profil Lulusan", to: "/akademik/profil-lulusan" },
        { label: "Prospek Kerja", to: "/akademik/prospek-kerja" },
      ],
    }),
  },
  {
    keywords: ["dosen", "pengajar", "staf", "staff", "guru besar"],
    reply: () => ({
      text: "Program studi didukung dosen bersertifikasi & berpengalaman. Lihat daftar dosen dan klik kartunya untuk biodata.",
      links: [{ label: "Lihat Dosen", to: "/tentang/dosen" }],
    }),
  },
  {
    keywords: ["akreditasi", "ban-pt", "ban pt", "peringkat"],
    reply: (get) => ({
      text: `Akreditasi: ${get("profil_akreditasi_peringkat", "Baik Sekali")} (${get("profil_akreditasi_lembaga", "BAN-PT")}). Detail di halaman Akreditasi.`,
      links: [{ label: "Akreditasi", to: "/tentang/akreditasi" }],
    }),
  },
  {
    keywords: ["visi", "misi", "tujuan"],
    reply: () => ({ text: "Visi, misi, dan tujuan program studi ada di halaman berikut.", links: [{ label: "Visi, Misi & Tujuan", to: "/visi-misi" }] }),
  },
  {
    keywords: ["berita", "informasi", "pengumuman", "kabar", "news"],
    reply: () => ({ text: "Kabar dan pengumuman terbaru program studi:", links: [{ label: "Berita Terbaru", to: "/berita" }] }),
  },
  {
    keywords: ["galeri", "foto", "kegiatan", "dokumentasi", "gambar"],
    reply: () => ({ text: "Dokumentasi kegiatan & fasilitas ada di galeri.", links: [{ label: "Galeri", to: "/galeri" }] }),
  },
  {
    keywords: ["kontak", "alamat", "lokasi", "email", "telepon", "telpon", "hubungi", "wa", "nomor"],
    reply: (get) => ({
      text: `Anda bisa menghubungi kami:\n📍 ${get("kontak_alamat", "Kampus Program Studi PTIK")}\n✉️ ${get("kontak_email", "info@ptik.ac.id")}\n☎️ ${get("kontak_telepon", "-")}`,
      links: [
        { label: "Halaman Kontak", to: "/kontak" },
        { label: "Lokasi Kampus", to: "/tentang/lokasi" },
      ],
    }),
  },
  {
    keywords: ["kewirausahaan", "it solution", "startup", "produk"],
    reply: () => ({ text: "PTIK IT Solution adalah wadah kewirausahaan berbasis teknologi bagi sivitas akademika.", links: [{ label: "IT Solution", to: "/kewirausahaan" }] }),
  },
  {
    keywords: ["download", "unduh", "berkas", "dokumen", "formulir"],
    reply: () => ({ text: "Berkas & dokumen penting dapat diunduh di halaman Download.", links: [{ label: "Download", to: "/download" }] }),
  },
  {
    keywords: ["biaya", "spp", "uang kuliah", "ukt", "beasiswa", "bayar"],
    reply: () => ({
      text: "Untuk informasi biaya kuliah & beasiswa, silakan hubungi tim kami melalui halaman Kontak atau mulai proses pendaftaran.",
      links: [
        { label: "Kontak", to: "/kontak" },
        { label: "Pendaftaran", to: "/daftar" },
      ],
    }),
  },
  {
    keywords: ["terima kasih", "makasih", "thanks", "thank you"],
    reply: () => ({ text: "Sama-sama! 😊 Ada lagi yang ingin ditanyakan?" }),
  },
  {
    keywords: ["halo", "hai", "hi", "assalamu", "pagi", "siang", "sore", "malam", "help", "bantuan"],
    reply: () => ({ text: "Halo! 👋 Saya bisa bantu soal pendaftaran, kurikulum, akademik, dosen, dan kontak. Silakan tanya." }),
  },
];

function matchReply(input: string, get: Getter): Reply {
  const t = ` ${input.toLowerCase().replace(/[^\w\s]/g, " ")} `;
  let best: (typeof INTENTS)[number] | null = null;
  let bestScore = 0;
  for (const it of INTENTS) {
    let score = 0;
    for (const k of it.keywords) if (t.includes(k)) score += k.length > 4 ? 2 : 1;
    if (score > bestScore) {
      bestScore = score;
      best = it;
    }
  }
  if (best && bestScore > 0) return best.reply(get);
  return {
    text: "Maaf, saya belum paham 🙏. Coba tanyakan tentang pendaftaran, kurikulum, akademik, dosen, atau kontak — atau pakai tombol cepat di bawah.",
  };
}

const QUICK = ["Cara pendaftaran?", "Kurikulum & SKS", "Info akademik", "Lihat dosen", "Kontak prodi"];
const GREETING: Msg = {
  role: "bot",
  text: "Halo! 👋 Saya Asisten PTIK. Ada yang bisa saya bantu? Pilih pertanyaan cepat di bawah atau ketik langsung.",
};

export function ChatbotWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { get } = useSiteContent();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (pathname === "/admin/ptik/login") return null;

  const send = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setInput("");
    const reply = matchReply(q, get);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "bot", ...reply }]);
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Tutup asisten" : "Buka asisten"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lg shadow-violet-900/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[30rem] max-h-[calc(100vh-8rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-soft-lg">
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                Asisten PTIK <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
                {m.links && m.links.length > 0 && (
                  <div className="mt-1.5 flex max-w-[85%] flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <button
                        key={l.to}
                        onClick={() => {
                          navigate(l.to);
                          setOpen(false);
                        }}
                        className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick chips */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2 scrollbar-thin">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan…"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Kirim"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
