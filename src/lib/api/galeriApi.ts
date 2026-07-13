import { api } from "./client";

export interface Galeri {
  id: string;
  judul: string;
  keterangan: string;
  tanggal: string;
  gambar: string;
  created_at: string;
  updated_at: string;
}

export type GaleriInput = Omit<Galeri, "id" | "created_at" | "updated_at">;

export function listGaleri(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Galeri[]>(`/galeri${qs}`);
}
export function getGaleri(id: string) {
  return api.get<Galeri>(`/galeri/${encodeURIComponent(id)}`);
}
export function createGaleri(input: GaleriInput) {
  return api.post<Galeri>("/galeri", input);
}
export function updateGaleri(id: string, input: GaleriInput) {
  return api.put<Galeri>(`/galeri/${encodeURIComponent(id)}`, input);
}
export function deleteGaleri(id: string) {
  return api.delete<void>(`/galeri/${encodeURIComponent(id)}`);
}
