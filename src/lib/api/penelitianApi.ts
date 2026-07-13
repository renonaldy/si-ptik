import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Penelitian {
  id: string;
  nama_penelitian: string;
  jenis_penelitian: string;
  author: string;
  tanggal: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type PenelitianInput = Omit<Penelitian, "id" | "created_at" | "updated_at">;

export function listPenelitian(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Penelitian[]>(`/penelitian${qs}`);
}
export function getPenelitian(id: string) {
  return api.get<Penelitian>(`/penelitian/${encodeURIComponent(id)}`);
}
export function createPenelitian(input: PenelitianInput) {
  return api.post<Penelitian>("/penelitian", input);
}
export function updatePenelitian(id: string, input: PenelitianInput) {
  return api.put<Penelitian>(`/penelitian/${encodeURIComponent(id)}`, input);
}
export function deletePenelitian(id: string) {
  return api.delete<void>(`/penelitian/${encodeURIComponent(id)}`);
}
