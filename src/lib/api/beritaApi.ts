import { api } from "./client";

export interface Berita {
  id: string;
  judul: string;
  penulis: string;
  tanggal: string;
  ringkasan: string;
  konten: string;
  gambar: string;
  created_at: string;
  updated_at: string;
}

export type BeritaInput = Omit<Berita, "id" | "created_at" | "updated_at">;

export function listBerita(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Berita[]>(`/berita${qs}`);
}
export function getBerita(id: string) {
  return api.get<Berita>(`/berita/${encodeURIComponent(id)}`);
}
export function createBerita(input: BeritaInput) {
  return api.post<Berita>("/berita", input);
}
export function updateBerita(id: string, input: BeritaInput) {
  return api.put<Berita>(`/berita/${encodeURIComponent(id)}`, input);
}
export function deleteBerita(id: string) {
  return api.delete<void>(`/berita/${encodeURIComponent(id)}`);
}
