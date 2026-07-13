import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Administrasi {
  id: string;
  nama: string;
  npm: string;
  kategori: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type AdministrasiInput = Omit<Administrasi, "id" | "created_at" | "updated_at">;

export function listAdministrasi(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Administrasi[]>(`/administrasi${qs}`);
}
export function getAdministrasi(id: string) {
  return api.get<Administrasi>(`/administrasi/${encodeURIComponent(id)}`);
}
export function createAdministrasi(input: AdministrasiInput) {
  return api.post<Administrasi>("/administrasi", input);
}
export function updateAdministrasi(id: string, input: AdministrasiInput) {
  return api.put<Administrasi>(`/administrasi/${encodeURIComponent(id)}`, input);
}
export function deleteAdministrasi(id: string) {
  return api.delete<void>(`/administrasi/${encodeURIComponent(id)}`);
}
