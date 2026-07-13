import { api } from "./client";

export interface Ujian {
  id: string;
  nama: string;
  npm: string;
  jenis: string; // "sempro" | "kompre"
  judul: string;
  pembimbing: string;
  penguji1: string;
  penguji2: string;
  tanggal: string;
  jam: string;
  jam_selesai: string;
  ruang: string;
  status: string; // "akan" | "sedang" | "sudah"
  foto: string;
  file_skripsi: string;
  file_ppt: string;
  created_at: string;
  updated_at: string;
}

export type UjianInput = Omit<Ujian, "id" | "created_at" | "updated_at">;

export const JENIS_OPTIONS = [
  { value: "sempro", label: "Seminar Proposal (Sempro)" },
  { value: "kompre", label: "Ujian Komprehensif (Kompre)" },
];

export const STATUS_OPTIONS = [
  { value: "akan", label: "Akan Ujian" },
  { value: "sedang", label: "Sedang Ujian" },
  { value: "sudah", label: "Sudah Ujian" },
];

export function listUjian(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Ujian[]>(`/ujian${qs}`);
}
export function getUjian(id: string) {
  return api.get<Ujian>(`/ujian/${encodeURIComponent(id)}`);
}
export function createUjian(input: UjianInput) {
  return api.post<Ujian>("/ujian", input);
}
export function updateUjian(id: string, input: UjianInput) {
  return api.put<Ujian>(`/ujian/${encodeURIComponent(id)}`, input);
}
export function deleteUjian(id: string) {
  return api.delete<void>(`/ujian/${encodeURIComponent(id)}`);
}
