import { api } from "./client";

export interface Pendaftaran {
  id: string;
  nama: string;
  email: string;
  no_hp: string;
  asal_sekolah: string;
  jenis: string;
  pesan: string;
  created_at: string;
  updated_at: string;
}

export type PendaftaranInput = Omit<Pendaftaran, "id" | "created_at" | "updated_at">;

export function listPendaftaran(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Pendaftaran[]>(`/pendaftaran${qs}`);
}
export function getPendaftaran(id: string) {
  return api.get<Pendaftaran>(`/pendaftaran/${encodeURIComponent(id)}`);
}
export function createPendaftaran(input: PendaftaranInput) {
  return api.post<Pendaftaran>("/pendaftaran", input);
}
export function updatePendaftaran(id: string, input: PendaftaranInput) {
  return api.put<Pendaftaran>(`/pendaftaran/${encodeURIComponent(id)}`, input);
}
export function deletePendaftaran(id: string) {
  return api.delete<void>(`/pendaftaran/${encodeURIComponent(id)}`);
}
