import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Dosen {
  id: string;
  nama_dosen: string;
  nik: string;
  nidn: string;
  no_hp: string;
  jabatan: string;
  pangkat: string;
  no_sertifikasi: string;
  status: string;
  foto: string;
  tempat: string;  // tempat lahir
  tanggal: string; // tanggal lahir (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

// Writable fields for create/update.
export type DosenInput = Omit<Dosen, "id" | "created_at" | "updated_at">;

export function listDosen(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Dosen[]>(`/dosen${qs}`);
}
export function getDosen(id: string) {
  return api.get<Dosen>(`/dosen/${encodeURIComponent(id)}`);
}
export function createDosen(input: DosenInput) {
  return api.post<Dosen>("/dosen", input);
}
export function updateDosen(id: string, input: DosenInput) {
  return api.put<Dosen>(`/dosen/${encodeURIComponent(id)}`, input);
}
export function deleteDosen(id: string) {
  return api.delete<void>(`/dosen/${encodeURIComponent(id)}`);
}
