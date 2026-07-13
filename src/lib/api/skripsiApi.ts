import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Skripsi {
  id: string;
  nama: string;
  npm: string;
  judul_skripsi: string;
  pembimbing: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type SkripsiInput = Omit<Skripsi, "id" | "created_at" | "updated_at">;

export function listSkripsi(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Skripsi[]>(`/skripsi${qs}`);
}
export function getSkripsi(id: string) {
  return api.get<Skripsi>(`/skripsi/${encodeURIComponent(id)}`);
}
export function createSkripsi(input: SkripsiInput) {
  return api.post<Skripsi>("/skripsi", input);
}
export function updateSkripsi(id: string, input: SkripsiInput) {
  return api.put<Skripsi>(`/skripsi/${encodeURIComponent(id)}`, input);
}
export function deleteSkripsi(id: string) {
  return api.delete<void>(`/skripsi/${encodeURIComponent(id)}`);
}
