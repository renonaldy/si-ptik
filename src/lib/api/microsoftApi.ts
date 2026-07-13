import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Microsoft {
  id: string;
  nama: string;
  email: string;
  jenis_pelatihan: string;
  tanggal_pelatihan: string;
  created_at: string;
  updated_at: string;
}

export type MicrosoftInput = Omit<Microsoft, "id" | "created_at" | "updated_at">;

export function listMicrosoft(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Microsoft[]>(`/microsoft${qs}`);
}
export function getMicrosoft(id: string) {
  return api.get<Microsoft>(`/microsoft/${encodeURIComponent(id)}`);
}
export function createMicrosoft(input: MicrosoftInput) {
  return api.post<Microsoft>("/microsoft", input);
}
export function updateMicrosoft(id: string, input: MicrosoftInput) {
  return api.put<Microsoft>(`/microsoft/${encodeURIComponent(id)}`, input);
}
export function deleteMicrosoft(id: string) {
  return api.delete<void>(`/microsoft/${encodeURIComponent(id)}`);
}
