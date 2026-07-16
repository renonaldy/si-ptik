// Command seed inserts demo users (with roles) and sample rows for every domain
// so a fresh database is immediately usable. Idempotent: existing rows are left alone.
package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"ptik/internal/domain/administrasi"
	"ptik/internal/domain/alumni"
	"ptik/internal/domain/berita"
	"ptik/internal/domain/content"
	"ptik/internal/domain/dosen"
	"ptik/internal/domain/download"
	"ptik/internal/domain/galeri"
	"ptik/internal/domain/microsoft"
	"ptik/internal/domain/penelitian"
	"ptik/internal/domain/promosi"
	"ptik/internal/domain/sempro"
	"ptik/internal/domain/skripsi"
	"ptik/internal/domain/skripsialumni"
	"ptik/internal/domain/sumbangan"
	"ptik/internal/domain/ujian"
	"ptik/internal/domain/user"
	"ptik/internal/domain/wisudawan"
	pgRepo "ptik/internal/repository/postgres"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		slog.Error("seed: DATABASE_URL is required")
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		slog.Error("seed: db connect failed", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	// ── Users (with roles) ──
	// Mahasiswa log in with their NPM (not an email); everyone else uses email.
	userRepo := pgRepo.NewUserRepository(pool)
	seedUser(ctx, userRepo, "superadmin@ptik.id", "reno28", "Renonaldy Pratama D", "super_admin")
	seedUser(ctx, userRepo, getEnv("SEED_ADMIN_EMAIL", "admin@ptik.id"), getEnv("SEED_ADMIN_PASSWORD", "admin12345"), "Administrator PTIK", "admin")
	dosenUserID := seedUser(ctx, userRepo, "dosen@ptik.id", "dosen12345", "Dr. Andi Wijaya, M.Kom", "dosen")
	mahasiswaUserID := seedUser(ctx, userRepo, "1810013231009", "mahasiswa12345", "Rizky Pratama", "mahasiswa")

	// ── Sample data per domain ──
	if empty(ctx, pool, "dosens") {
		r := pgRepo.NewDosenRepository(pool)
		must(r.Create(ctx, id("dosen"), dosen.Input{NamaDosen: "Dr. Andi Wijaya, M.Kom", NIDN: "0101018001", NIK: "3271010101800001", NoHP: "081234567890", Jabatan: "Ketua Program Studi", Pangkat: "Lektor Kepala", NoSertifikasi: "SERT-2019-001", Status: "Aktif", TempatLahir: "Bandung", TanggalLahir: "1980-01-01"}))
		must(r.Create(ctx, id("dosen"), dosen.Input{NamaDosen: "Siti Nurhaliza, M.T", NIDN: "0202028502", Jabatan: "Dosen Tetap", Pangkat: "Lektor", Status: "Aktif", TempatLahir: "Surabaya", TanggalLahir: "1985-02-02"}))
	}
	if empty(ctx, pool, "alumnis") {
		r := pgRepo.NewAlumniRepository(pool)
		must(r.Create(ctx, id("alumni"), alumni.Input{NamaAlumni: "Rizky Pratama", NPM: "1701010001", TempatLahir: "Jakarta", TanggalLahir: "1999-05-10"}))
		must(r.Create(ctx, id("alumni"), alumni.Input{NamaAlumni: "Dewi Lestari", NPM: "1701010002", TempatLahir: "Semarang", TanggalLahir: "2000-08-17"}))
	}
	if empty(ctx, pool, "administrasis") {
		r := pgRepo.NewAdministrasiRepository(pool)
		must(r.Create(ctx, id("administrasi"), administrasi.Input{Nama: "Rizky Pratama", NPM: "1701010001", Kategori: "KTM"}))
	}
	if empty(ctx, pool, "penelitians") {
		r := pgRepo.NewPenelitianRepository(pool)
		must(r.Create(ctx, id("penelitian"), penelitian.Input{NamaPenelitian: "Deteksi Objek Berbasis AI", JenisPenelitian: "Hibah", Author: "Dr. Andi Wijaya", Tanggal: "2024-03-01"}))
	}
	if empty(ctx, pool, "skripsis") {
		r := pgRepo.NewSkripsiRepository(pool)
		must(r.Create(ctx, id("skripsi"), skripsi.Input{Nama: "Budi Santoso", NPM: "1801010005", JudulSkripsi: "Sistem Informasi Akademik", Pembimbing: "Dr. Andi Wijaya"}))
	}
	if empty(ctx, pool, "skripsi_alumnis") {
		r := pgRepo.NewSkripsiAlumniRepository(pool)
		must(r.Create(ctx, id("skripsi-alumni"), skripsialumni.Input{NamaAlumni: "Dewi Lestari", NPM: "1701010002", JudulSkripsi: "Analisis Data Mahasiswa", Pembimbing: "Siti Nurhaliza"}))
	}
	if empty(ctx, pool, "sempros") {
		r := pgRepo.NewSemproRepository(pool)
		must(r.Create(ctx, id("sempro"), sempro.Input{Nama: "Eka Putri", NPM: "1901010009", Judul: "Chatbot Layanan Kampus", Pembimbing: "Dr. Andi Wijaya"}))
	}
	if empty(ctx, pool, "wisudawans") {
		r := pgRepo.NewWisudawanRepository(pool)
		must(r.Create(ctx, id("wisudawan"), wisudawan.Input{NamaWisudawan: "Fajar Nugroho", NPM: "1701010010", JudulSkripsi: "IoT Monitoring", Pembimbing: "Siti Nurhaliza", TanggalSidang: "2024-05-05"}))
	}
	if empty(ctx, pool, "sumbangans") {
		r := pgRepo.NewSumbanganRepository(pool)
		must(r.Create(ctx, id("sumbangan"), sumbangan.Input{NamaAlumni: "Rizky Pratama", NPM: "1701010001", Sumbangan: "Buku Referensi", Jumlah: "5"}))
	}
	if empty(ctx, pool, "microsofts") {
		r := pgRepo.NewMicrosoftRepository(pool)
		must(r.Create(ctx, id("microsoft"), microsoft.Input{Nama: "Hadi Kusuma", NPM: "2101010007", JenisPelatihan: "Microsoft Excel", BuktiPembayaran: ""}))
	}
	if empty(ctx, pool, "beritas") {
		r := pgRepo.NewBeritaRepository(pool)
		must(r.Create(ctx, id("berita"), berita.Input{Judul: "Wisuda Periode Ganjil 2024/2025", Ringkasan: "Program Studi PTIK mewisuda 42 lulusan baru.", Konten: "Program Studi PTIK dengan bangga mewisuda 42 lulusan pada periode ganjil tahun akademik 2024/2025. Acara berlangsung khidmat di aula kampus.", Penulis: "Humas PTIK", Tanggal: "2024-11-20"}))
		must(r.Create(ctx, id("berita"), berita.Input{Judul: "Kuliah Tamu: Tren AI di Industri", Ringkasan: "Menghadirkan praktisi AI dari industri teknologi.", Konten: "Program Studi PTIK menyelenggarakan kuliah tamu bertema kecerdasan buatan dan penerapannya di industri, diikuti lebih dari 150 mahasiswa.", Penulis: "Humas PTIK", Tanggal: "2024-10-05"}))
	}
	if empty(ctx, pool, "galeris") {
		r := pgRepo.NewGaleriRepository(pool)
		must(r.Create(ctx, id("galeri"), galeri.Input{Judul: "Lab Komputer", Gambar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", Keterangan: "Fasilitas laboratorium komputer terbaru.", Tanggal: "2024-09-01"}))
		must(r.Create(ctx, id("galeri"), galeri.Input{Judul: "Seminar Nasional", Gambar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", Keterangan: "Suasana seminar nasional teknologi.", Tanggal: "2024-08-15"}))
		must(r.Create(ctx, id("galeri"), galeri.Input{Judul: "Workshop Coding", Gambar: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800", Keterangan: "Kegiatan workshop pemrograman mahasiswa.", Tanggal: "2024-07-10"}))
	}
	if empty(ctx, pool, "promosis") {
		r := pgRepo.NewPromosiRepository(pool)
		must(r.Create(ctx, id("promosi"), promosi.Input{Judul: "Flyer PMB 2025/2026", Tipe: "flyer", Media: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", Keterangan: "Penerimaan mahasiswa baru program studi PTIK.", Tanggal: "2025-01-10"}))
		must(r.Create(ctx, id("promosi"), promosi.Input{Judul: "Video Profil PTIK", Tipe: "video", Sumber: "youtube", Media: "https://www.youtube.com/watch?v=jNQXAC9IVRw", Keterangan: "Profil singkat program studi PTIK.", Tanggal: "2024-12-01"}))
	}
	if empty(ctx, pool, "downloads") {
		r := pgRepo.NewDownloadRepository(pool)
		must(r.Create(ctx, id("download"), download.Input{Judul: "Panduan Akademik 2024", Keterangan: "Buku panduan akademik program studi.", Kategori: "Akademik", File: "https://example.com/panduan-akademik.pdf"}))
		must(r.Create(ctx, id("download"), download.Input{Judul: "Template Skripsi", Keterangan: "Format penulisan skripsi terbaru.", Kategori: "Skripsi", File: "https://example.com/template-skripsi.docx"}))
	}

	if empty(ctx, pool, "ujians") {
		r := pgRepo.NewUjianRepository(pool)
		samples := []ujian.Input{
			{Nama: "Budi Santoso", NPM: "1801010005", Jenis: "sempro", Judul: "Sistem Informasi Akademik", Pembimbing: "Dr. Andi Wijaya", Tanggal: "2024-12-02", Ruang: "R.301", Status: "akan", Foto: "https://i.pravatar.cc/300?img=12"},
			{Nama: "Eka Putri", NPM: "1901010009", Jenis: "sempro", Judul: "Chatbot Layanan Kampus", Pembimbing: "Siti Nurhaliza", Tanggal: "2024-11-28", Ruang: "R.302", Status: "sedang", Foto: "https://i.pravatar.cc/300?img=45"},
			{Nama: "Rina Kartika", NPM: "1801010012", Jenis: "sempro", Judul: "Aplikasi Absensi QR", Pembimbing: "Dr. Andi Wijaya", Tanggal: "2024-11-20", Ruang: "R.301", Status: "sudah", Foto: "https://i.pravatar.cc/300?img=32"},
			{Nama: "Fajar Nugroho", NPM: "1701010010", Jenis: "kompre", Judul: "IoT Monitoring Suhu", Pembimbing: "Siti Nurhaliza", Tanggal: "2024-12-05", Ruang: "R.Sidang", Status: "akan", Foto: "https://i.pravatar.cc/300?img=13"},
			{Nama: "Dewi Lestari", NPM: "1701010002", Jenis: "kompre", Judul: "Analisis Data Mahasiswa", Pembimbing: "Dr. Andi Wijaya", Tanggal: "2024-11-27", Ruang: "R.Sidang", Status: "sedang", Foto: "https://i.pravatar.cc/300?img=47"},
			{Nama: "Rizky Pratama", NPM: "1701010001", Jenis: "kompre", Judul: "E-Learning Adaptif", Pembimbing: "Siti Nurhaliza", Tanggal: "2024-11-15", Ruang: "R.Sidang", Status: "sudah", Foto: "https://i.pravatar.cc/300?img=15"},
		}
		for _, in := range samples {
			must(r.Create(ctx, id("ujian"), in))
		}
		slog.Info("seed: sample ujian created", "count", len(samples))
	}
	if empty(ctx, pool, "site_contents") {
		r := pgRepo.NewContentRepository(pool)
		defaults := []content.Item{
			{Key: "home_badge", Value: "Program Studi Terakreditasi"},
			{Key: "home_hero_title", Value: "Pendidikan Teknik Informatika & Komputer"},
			{Key: "home_hero_subtitle", Value: "Mencetak pendidik dan profesional teknologi yang kompeten, adaptif, dan berdaya saing global."},
			{Key: "home_stat1_value", Value: "B"}, {Key: "home_stat1_label", Value: "Akreditasi"},
			{Key: "home_stat2_value", Value: "500+"}, {Key: "home_stat2_label", Value: "Alumni"},
			{Key: "home_stat3_value", Value: "25+"}, {Key: "home_stat3_label", Value: "Dosen"},
			{Key: "home_stat4_value", Value: "2010"}, {Key: "home_stat4_label", Value: "Berdiri"},
			{Key: "visi", Value: "Menjadi program studi unggulan yang menghasilkan pendidik dan profesional teknologi informasi yang kompeten, inovatif, dan berdaya saing global pada tahun 2030."},
			{Key: "misi", Value: "Menyelenggarakan pendidikan berkualitas di bidang teknik informatika dan komputer.\nMengembangkan penelitian yang inovatif dan aplikatif bagi masyarakat.\nMelaksanakan pengabdian kepada masyarakat berbasis teknologi.\nMembangun kerja sama dengan dunia industri dan institusi pendidikan.\nMenumbuhkan jiwa kewirausahaan berbasis teknologi bagi mahasiswa."},
			{Key: "tujuan", Value: "Menghasilkan lulusan yang kompeten, profesional, dan berakhlak.\nMenghasilkan karya penelitian yang bermanfaat dan terpublikasi.\nMeningkatkan peran program studi dalam pembangunan masyarakat."},
			{Key: "akademik_jenjang", Value: "Sarjana (S1)"},
			{Key: "akademik_sks", Value: "144 SKS"},
			{Key: "akademik_masa", Value: "8 Semester"},
			{Key: "kewirausahaan_intro", Value: "Unit kewirausahaan mahasiswa & dosen PTIK yang menyediakan solusi teknologi profesional."},
			{Key: "kontak_title", Value: "Kontak"},
			{Key: "kontak_subtitle", Value: "Punya pertanyaan? Hubungi kami atau kirim pesan."},
			{Key: "kontak_alamat", Value: "Kampus PTIK, Jl. Pendidikan No. 1, Indonesia"},
			{Key: "kontak_email", Value: "info@ptik.id"},
			{Key: "kontak_telepon", Value: "(021) 123-4567"},
			{Key: "kontak_jam", Value: "Senin–Jumat, 08.00–16.00 WIB"},
		}
		for _, it := range defaults {
			if err := r.Upsert(ctx, it.Key, it.Value); err != nil {
				slog.Error("seed: content failed", "err", err)
				os.Exit(1)
			}
		}
		slog.Info("seed: site content created", "count", len(defaults))
	}

	// ── Default sidebar access for the demo dosen/mahasiswa accounts ──
	// Menu access is per-account (keyed by user id); admins always see everything.
	if empty(ctx, pool, "user_menus") {
		r := pgRepo.NewMenuAccessRepository(pool)
		defaults := []struct {
			userID   string
			menuKeys []string
		}{
			{dosenUserID, []string{"dashboard", "dosen", "penelitian", "skripsi", "sempro", "ujian", "wisudawan"}},
			{mahasiswaUserID, []string{"dashboard", "ujian", "berita", "galeri", "download"}},
		}
		n := 0
		for _, it := range defaults {
			if it.userID == "" {
				continue
			}
			if err := r.Upsert(ctx, it.userID, it.menuKeys, nil); err != nil {
				slog.Error("seed: user menu failed", "err", err)
				os.Exit(1)
			}
			n++
		}
		slog.Info("seed: user menus created", "count", n)
	}

	slog.Info("seed: done")
}

// seedUser creates the account if missing and returns its user id (either the
// existing row's or the newly-minted one) so callers can seed related config.
func seedUser(ctx context.Context, repo *pgRepo.UserRepository, email, password, name, role string) string {
	existing, err := repo.GetByEmail(ctx, email)
	if err != nil {
		slog.Error("seed: lookup user failed", "email", email, "err", err)
		os.Exit(1)
	}
	if existing != nil {
		slog.Info("seed: user exists", "email", email, "role", role)
		return existing.ID
	}
	newID := id("user")
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err := repo.Create(ctx, &user.User{ID: newID, Email: email, PasswordHash: string(hash), FullName: name, Role: role}); err != nil {
		slog.Error("seed: create user failed", "email", email, "err", err)
		os.Exit(1)
	}
	slog.Info("seed: user created", "email", email, "password", password, "role", role)
	return newID
}

func empty(ctx context.Context, pool *pgxpool.Pool, table string) bool {
	var n int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM "+table).Scan(&n); err != nil {
		slog.Error("seed: count failed", "table", table, "err", err)
		os.Exit(1)
	}
	return n == 0
}

func must[T any](_ *T, err error) {
	if err != nil {
		slog.Error("seed: insert failed", "err", err)
		os.Exit(1)
	}
}

func id(prefix string) string { return prefix + "-" + uuid.NewString() }

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
