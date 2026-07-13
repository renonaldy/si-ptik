import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Sumbangan {
  id: string;
  nama_alumni: string;
  npm: string;
  sumbangan: string;
  jumlah: string;
  created_at: string;
  updated_at: string;
}

export type SumbanganInput = Omit<Sumbangan, "id" | "created_at" | "updated_at">;

export function listSumbangan(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Sumbangan[]>(`/sumbangan${qs}`);
}
export function getSumbangan(id: string) {
  return api.get<Sumbangan>(`/sumbangan/${encodeURIComponent(id)}`);
}
export function createSumbangan(input: SumbanganInput) {
  return api.post<Sumbangan>("/sumbangan", input);
}
export function updateSumbangan(id: string, input: SumbanganInput) {
  return api.put<Sumbangan>(`/sumbangan/${encodeURIComponent(id)}`, input);
}
export function deleteSumbangan(id: string) {
  return api.delete<void>(`/sumbangan/${encodeURIComponent(id)}`);
}
