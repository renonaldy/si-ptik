// Testimonials & FAQ are stored as JSON in the site-content CMS
// (keys `home_testimonials` and `home_faq`). These defaults are the fallback
// shown when a key is empty, and the seed the admin editor starts from.

export type Testimonial = { name: string; role: string; quote: string };
export type Faq = { q: string; a: string };

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Rizky Ananda", role: "Alumni 2019", quote: "Kurikulumnya sangat aplikatif. Ilmu yang saya dapat langsung terpakai saat bekerja sebagai software engineer." },
  { name: "Dewi Lestari", role: "Alumni 2020", quote: "Dosen-dosennya suportif dan selalu mendorong kami untuk berinovasi. Pengalaman kuliah yang berkesan." },
  { name: "Bagus Prakoso", role: "Mahasiswa Tingkat Akhir", quote: "Fasilitas laboratorium lengkap, dan banyak kesempatan ikut kompetisi teknologi tingkat nasional." },
  { name: "Siti Nurhaliza", role: "Alumni 2018", quote: "Jaringan alumni sangat membantu saat mencari peluang karier. Bangga menjadi bagian dari PTIK." },
  { name: "Andi Firmansyah", role: "Guru SMK", quote: "Bekal pedagogik dan teknis di PTIK membuat saya siap mengajar TIK dengan pendekatan modern." },
  { name: "Maya Kartika", role: "Alumni 2021", quote: "Program kewirausahaan IT-nya membuka wawasan saya untuk membangun startup teknologi sendiri." },
  { name: "Fajar Nugroho", role: "Mahasiswa", quote: "Suasana belajar kolaboratif. Banyak proyek nyata yang mengasah kemampuan problem solving." },
  { name: "Intan Permata", role: "Alumni 2017", quote: "Program studi yang terus berkembang mengikuti tren teknologi. Rekomendasi untuk calon mahasiswa." },
  { name: "Yoga Pratama", role: "IT Support", quote: "Dari sini saya belajar dasar yang kuat, dari jaringan sampai pemrograman. Sangat bermanfaat." },
];

export const DEFAULT_FAQS: Faq[] = [
  { q: "Program apa saja yang tersedia di SI PTIK?", a: "Program Studi Pendidikan Teknik Informatika dan Komputer (PTIK) menyiapkan lulusan sebagai pendidik sekaligus profesional di bidang teknologi informasi dan komputer, didukung kurikulum yang relevan dengan industri." },
  { q: "Bagaimana cara mendaftar sebagai mahasiswa baru?", a: "Klik tombol Daftar Sekarang, lengkapi formulir online, dan tim kami akan menghubungi Anda untuk proses selanjutnya. Informasi jadwal dan syarat tersedia di halaman Akademik." },
  { q: "Apakah tersedia informasi akademik secara online?", a: "Ya. Kalender akademik, panduan, dan berkas penting dapat diakses melalui halaman Akademik dan Download tanpa perlu login." },
  { q: "Bagaimana menghubungi program studi?", a: "Gunakan halaman Kontak untuk mengirim pesan langsung kepada kami, atau temukan informasi alamat dan kontak resmi program studi di sana." },
];

export function parseTestimonials(raw: string): Testimonial[] {
  if (!raw || !raw.trim()) return DEFAULT_TESTIMONIALS;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return DEFAULT_TESTIMONIALS;
    const out = arr
      .filter((x) => x && typeof x.name === "string" && typeof x.quote === "string" && x.name.trim() && x.quote.trim())
      .map((x) => ({ name: String(x.name), role: String(x.role ?? ""), quote: String(x.quote) }));
    return out.length ? out : DEFAULT_TESTIMONIALS;
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}

export function parseFaqs(raw: string): Faq[] {
  if (!raw || !raw.trim()) return DEFAULT_FAQS;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return DEFAULT_FAQS;
    const out = arr
      .filter((x) => x && typeof x.q === "string" && typeof x.a === "string" && x.q.trim() && x.a.trim())
      .map((x) => ({ q: String(x.q), a: String(x.a) }));
    return out.length ? out : DEFAULT_FAQS;
  } catch {
    return DEFAULT_FAQS;
  }
}
