import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export type MicrosoftStatus = "pending" | "approved" | "rejected";

export interface Microsoft {
  id: string;
  nama: string;
  npm: string;
  jenis_pelatihan: string;
  bukti_pembayaran: string;
  status: MicrosoftStatus;
  created_at: string;
  updated_at: string;
}

export type MicrosoftInput = Pick<Microsoft, "nama" | "npm" | "jenis_pelatihan" | "bukti_pembayaran">;

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
export function updateMicrosoftStatus(id: string, status: MicrosoftStatus) {
  return api.patch<Microsoft>(`/microsoft/${encodeURIComponent(id)}/status`, { status });
}
export function deleteMicrosoft(id: string) {
  return api.delete<void>(`/microsoft/${encodeURIComponent(id)}`);
}
