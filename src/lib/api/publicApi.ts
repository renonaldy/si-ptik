import { api } from "./client";
import type { Berita } from "./beritaApi";
import type { Galeri } from "./galeriApi";
import type { Download } from "./downloadApi";
import type { SiteContent } from "./contentApi";
import type { Ujian } from "./ujianApi";

// Public (no-auth) reads from /public/* and inbound submissions.
export const listBeritaPublic = () => api.get<Berita[]>("/public/berita");
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
