import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Sempro {
  id: string;
  nama: string;
  npm: string;
  judul: string;
  pembimbing: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type SemproInput = Omit<Sempro, "id" | "created_at" | "updated_at">;

export function listSempro(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Sempro[]>(`/sempro${qs}`);
}
export function getSempro(id: string) {
  return api.get<Sempro>(`/sempro/${encodeURIComponent(id)}`);
}
export function createSempro(input: SemproInput) {
  return api.post<Sempro>("/sempro", input);
}
export function updateSempro(id: string, input: SemproInput) {
  return api.put<Sempro>(`/sempro/${encodeURIComponent(id)}`, input);
}
export function deleteSempro(id: string) {
  return api.delete<void>(`/sempro/${encodeURIComponent(id)}`);
}
