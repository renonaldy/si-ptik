import { api } from "./client";

export type PromosiTipe = "flyer" | "video";
/** Where the media URL points to. Flyers: upload/gdrive; videos: upload/youtube/gdrive.
 *  "" only appears on legacy flyer rows (treated as "upload"). */
export type PromosiSumber = "upload" | "youtube" | "gdrive" | "";

export interface Promosi {
  id: string;
  judul: string;
  tipe: PromosiTipe;
  media: string; // image URL (flyer) or video URL (upload/YouTube/GDrive)
  sumber: PromosiSumber;
  keterangan: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

export type PromosiInput = Omit<Promosi, "id" | "created_at" | "updated_at">;

export function listPromosi(search?: string, tipe?: PromosiTipe | "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (tipe) params.set("tipe", tipe);
  const qs = params.toString();
  return api.get<Promosi[]>(`/promosi${qs ? `?${qs}` : ""}`);
}
export function getPromosi(id: string) {
  return api.get<Promosi>(`/promosi/${encodeURIComponent(id)}`);
}
export function createPromosi(input: PromosiInput) {
  return api.post<Promosi>("/promosi", input);
}
export function updatePromosi(id: string, input: PromosiInput) {
  return api.put<Promosi>(`/promosi/${encodeURIComponent(id)}`, input);
}
export function deletePromosi(id: string) {
  return api.delete<void>(`/promosi/${encodeURIComponent(id)}`);
}
