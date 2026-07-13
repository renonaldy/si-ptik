import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Alumni {
  id: string;
  nama_alumni: string;
  npm: string;
  tempat: string;  // tempat lahir
  tanggal: string; // tanggal lahir (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

export type AlumniInput = Omit<Alumni, "id" | "created_at" | "updated_at">;

export function listAlumni(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Alumni[]>(`/alumni${qs}`);
}
export function getAlumni(id: string) {
  return api.get<Alumni>(`/alumni/${encodeURIComponent(id)}`);
}
export function createAlumni(input: AlumniInput) {
  return api.post<Alumni>("/alumni", input);
}
export function updateAlumni(id: string, input: AlumniInput) {
  return api.put<Alumni>(`/alumni/${encodeURIComponent(id)}`, input);
}
export function deleteAlumni(id: string) {
  return api.delete<void>(`/alumni/${encodeURIComponent(id)}`);
}
