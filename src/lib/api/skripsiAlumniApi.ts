import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface SkripsiAlumni {
  id: string;
  nama_alumni: string;
  npm: string;
  judul_skripsi: string;
  pembimbing: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type SkripsiAlumniInput = Omit<SkripsiAlumni, "id" | "created_at" | "updated_at">;

export function listSkripsiAlumni(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<SkripsiAlumni[]>(`/skripsi-alumni${qs}`);
}
export function getSkripsiAlumni(id: string) {
  return api.get<SkripsiAlumni>(`/skripsi-alumni/${encodeURIComponent(id)}`);
}
export function createSkripsiAlumni(input: SkripsiAlumniInput) {
  return api.post<SkripsiAlumni>("/skripsi-alumni", input);
}
export function updateSkripsiAlumni(id: string, input: SkripsiAlumniInput) {
  return api.put<SkripsiAlumni>(`/skripsi-alumni/${encodeURIComponent(id)}`, input);
}
export function deleteSkripsiAlumni(id: string) {
  return api.delete<void>(`/skripsi-alumni/${encodeURIComponent(id)}`);
}
