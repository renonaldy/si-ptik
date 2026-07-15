# Deploy SI PTIK ke Produksi (VPS)

Panduan menaikkan **ptik-bunghatta.com** ke internet. Ditulis untuk pemula.

> **Penting — shared hosting/cPanel tidak bisa.** Aplikasi ini butuh **Go** (proses
> yang jalan terus) + **PostgreSQL** + penyimpanan file permanen. Shared hosting
> Rumahweb tidak mendukung ketiganya. Anda memerlukan **VPS**. Domain yang sudah
> Anda punya tetap dipakai — cukup diarahkan ke VPS.

Semua bagian (frontend React, backend Go, database PostgreSQL) berjalan di **satu VPS**
lewat Docker Compose. Caddy menangani HTTPS otomatis (Let's Encrypt).

```
Internet ──443/80──▶  web (Caddy)  ──/api,/uploads──▶  api (Go)  ──▶  db (PostgreSQL)
                       serve React                     :8080            :5432 (privat)
```

---

## 1. Beli VPS

Beli VPS Linux. Bisa di **Rumahweb** (menu *VPS Murah*) atau penyedia lain
(DigitalOcean, Contabo, Biznet Gio, IDCloudHost).

**Spesifikasi minimal yang disarankan:**

| Item | Nilai |
|------|-------|
| OS | **Ubuntu 24.04 LTS** (atau 22.04) |
| RAM | **2 GB** (1 GB bisa, tapi tambahkan swap — lihat langkah 4) |
| CPU | 1–2 vCPU |
| Disk | 20 GB+ SSD |

Setelah aktif, catat: **IP publik**, **user** (biasanya `root`), dan **password/SSH key**.

> Shared hosting yang sudah terlanjur dibeli tetap berguna untuk **email**
> `@ptik-bunghatta.com`. Kalau tidak butuh, Anda bisa minta downgrade/refund ke Rumahweb.

---

## 2. Arahkan domain ke VPS (DNS)

Di panel pengelola domain `ptik-bunghatta.com` (Rumahweb clientzone → *Kelola DNS*,
atau cPanel → *Zone Editor*), buat 2 record **A**:

| Type | Name  | Value (Points to) | TTL |
|------|-------|-------------------|-----|
| A    | `@`   | `IP_VPS_ANDA`     | 3600 |
| A    | `www` | `IP_VPS_ANDA`     | 3600 |

Hapus record A/AAAA lama yang menunjuk ke shared hosting agar tidak bentrok.
Tunggu propagasi (5–30 menit). Cek: `ping ptik-bunghatta.com` harus menunjukkan IP VPS.

> HTTPS (langkah 7) hanya berhasil setelah DNS ini menunjuk ke VPS.

---

## 3. Masuk ke VPS via SSH

Dari komputer Anda (PowerShell di Windows sudah punya `ssh`):

```bash
ssh root@IP_VPS_ANDA
```

---

## 4. Install Docker (jalankan di VPS)

```bash
# Docker + Docker Compose plugin (skrip resmi)
curl -fsSL https://get.docker.com | sh
docker version && docker compose version   # pastikan keduanya muncul
```

**(Hanya jika RAM 1 GB)** tambahkan 2 GB swap agar build tidak kehabisan memori:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 5. Salin project ke VPS

**Opsi A — lewat Git (paling rapi).** Kalau kode sudah di GitHub/GitLab:

```bash
cd /opt
git clone <URL_REPO_ANDA> si-ptik
cd si-ptik
```

**Opsi B — upload langsung dari komputer.** Jalankan di **komputer Anda** (bukan VPS),
dari dalam folder `si-ptik`:

```bash
# lewati node_modules/dist/.git yang besar
rsync -av --exclude node_modules --exclude dist --exclude .git ./ root@IP_VPS_ANDA:/opt/si-ptik/
# (Windows tanpa rsync: pakai scp -r, atau WinSCP)
```

Lalu di VPS: `cd /opt/si-ptik`

---

## 6. Buat file konfigurasi `.env` (di VPS)

```bash
cd /opt/si-ptik
cp .env.prod.example .env
nano .env
```

Isi nilainya. Buat secret acak dulu dengan perintah ini lalu tempel hasilnya:

```bash
openssl rand -hex 32   # untuk JWT_SECRET
openssl rand -hex 24   # untuk POSTGRES_PASSWORD
```

Yang **wajib** diubah di `.env`:
- `SITE_ADDRESS` = `ptik-bunghatta.com, www.ptik-bunghatta.com`
- `SITE_URL` = `https://ptik-bunghatta.com`
- `ACME_EMAIL` = email aktif Anda
- `POSTGRES_PASSWORD`, `JWT_SECRET`, `SEED_ADMIN_PASSWORD` = jangan pakai nilai default!

Simpan (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 7. Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Build pertama makan beberapa menit (compile Go + build React). Pantau:

```bash
docker compose -f docker-compose.prod.yml ps       # semua harus "running"/"healthy"
docker compose -f docker-compose.prod.yml logs -f web   # lihat Caddy ambil sertifikat HTTPS
```

---

## 8. Buat akun admin pertama (sekali saja)

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint /seed api
```

Login pakai `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` dari `.env`.

---

## 9. Buka firewall

```bash
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
```

---

## 10. Verifikasi

- Buka **https://ptik-bunghatta.com** → website publik prodi muncul, gembok HTTPS aktif.
- **https://ptik-bunghatta.com/healthz** → menampilkan status OK (backend hidup).
- Buka `/login`, masuk sebagai admin → dashboard `/dashboard` terbuka.

Selesai. 🎉

---

## Operasi harian

**Update setelah ada perubahan kode:**
```bash
cd /opt/si-ptik
git pull                                             # atau rsync ulang
docker compose -f docker-compose.prod.yml up -d --build
```

**Lihat log:**
```bash
docker compose -f docker-compose.prod.yml logs -f api    # log backend
```

**Backup database (jalankan rutin / sebelum update):**
```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U ptik ptik_prod | gzip > backup_$(date +%F).sql.gz
```

**Restart / stop:**
```bash
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml down          # stop (data di volume tetap aman)
```

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|--------|-------------------|
| HTTPS gagal / "no certificate" | DNS belum menunjuk ke VPS, atau port 80/443 ketutup. Cek langkah 2 & 9, lalu `docker compose -f docker-compose.prod.yml logs web`. |
| Build ke-kill / kehabisan memori | RAM kurang → tambahkan swap (langkah 4) atau naikkan RAM VPS. |
| `web` sehat tapi `/api` error | Cek `logs api`. Biasanya `.env` (DATABASE_URL/JWT_SECRET) salah, atau migrate gagal. |
| Login gagal "invalid credentials" | Seed belum dijalankan (langkah 8), atau password bed  a dari `.env`. |
| File upload hilang setelah redeploy | Pastikan volume `uploads` tidak dihapus. Jangan pakai `down -v` (itu menghapus volume + data!). |
