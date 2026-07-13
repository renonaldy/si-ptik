import { api } from "./client";

// Domain type is colocated with its API module (flow-connect convention).
export interface Wisudawan {
  id: string;
  nama_wisudawan: string;
  npm: string;
  judul_skripsi: string;
  pembimbing: string;
  tanggal_sidang: string;
  foto: string;
  created_at: string;
  updated_at: string;
}

export type WisudawanInput = Omit<Wisudawan, "id" | "created_at" | "updated_at">;

export function listWisudawan(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Wisudawan[]>(`/wisudawan${qs}`);
}
export function getWisudawan(id: string) {
  return api.get<Wisudawan>(`/wisudawan/${encodeURIComponent(id)}`);
}
export function createWisudawan(input: WisudawanInput) {
  return api.post<Wisudawan>("/wisudawan", input);
}
export function updateWisudawan(id: string, input: WisudawanInput) {
  return api.put<Wisudawan>(`/wisudawan/${encodeURIComponent(id)}`, input);
}
export function deleteWisudawan(id: string) {
  return api.delete<void>(`/wisudawan/${encodeURIComponent(id)}`);
}
