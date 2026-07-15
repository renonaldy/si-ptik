import { api } from "./client";
import type { Berita } from "./beritaApi";
import type { Galeri } from "./galeriApi";
import type { Download } from "./downloadApi";
import type { SiteContent } from "./contentApi";
import type { Ujian } from "./ujianApi";

// Public (no-auth) view of a lecturer — sensitive fields (NIK/HP/sertifikasi) omitted by the API.
export interface DosenPublic {
  id: string;
  nama_dosen: string;
  nidn: string;
  jabatan: string;
  pangkat: string;
  status: string;
  foto: string;
}

// Public (no-auth) reads from /public/* and inbound submissions.
export const listBeritaPublic = () => api.get<Berita[]>("/public/berita");
export const listDosenPublic = () => api.get<DosenPublic[]>("/public/dosen");
export const getBeritaPublic = (id: string) => api.get<Berita>(`/public/berita/${encodeURIComponent(id)}`);
export const listGaleriPublic = () => api.get<Galeri[]>("/public/galeri");
export const listDownloadPublic = () => api.get<Download[]>("/public/download");
export const listContentPublic = () => api.get<SiteContent[]>("/public/content");
export const listUjianPublic = () => api.get<Ujian[]>("/public/ujian");
export const getUjianPublic = (id: string) => api.get<Ujian>(`/public/ujian/${encodeURIComponent(id)}`);

export interface PendaftaranInput {
  nama: string;
  email: string;
  no_hp: string;
  asal_sekolah: string;
  jenis: string; // "daftar" | "kontak"
  pesan: string;
}

export const submitPendaftaran = (input: PendaftaranInput) => api.post<unknown>("/public/pendaftaran", input);

// Public "Pelatihan Microsoft" registration (no auth). Awaits admin approval.
export interface PelatihanMicrosoftInput {
  nama: string;
  npm: string;
  jenis_pelatihan: string;
  bukti_pembayaran: string; // URL from the public upload endpoint
}

export const submitPelatihanMicrosoft = (input: PelatihanMicrosoftInput) =>
  api.post<unknown>("/public/pelatihan-microsoft", input);

// Privacy-safe public view of a registrant: NPM is masked (e.g. "2021****23") and
// the payment proof is not exposed.
export interface PelatihanMicrosoftPublic {
  id: string;
  nama: string;
  npm: string; // masked by the backend
  jenis_pelatihan: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const listPelatihanMicrosoftPublic = () =>
  api.get<PelatihanMicrosoftPublic[]>("/public/pelatihan-microsoft");
