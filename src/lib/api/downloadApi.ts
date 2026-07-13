import { api } from "./client";

export interface Download {
  id: string;
  judul: string;
  kategori: string;
  keterangan: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export type DownloadInput = Omit<Download, "id" | "created_at" | "updated_at">;

export function listDownload(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<Download[]>(`/download${qs}`);
}
export function getDownload(id: string) {
  return api.get<Download>(`/download/${encodeURIComponent(id)}`);
}
export function createDownload(input: DownloadInput) {
  return api.post<Download>("/download", input);
}
export function updateDownload(id: string, input: DownloadInput) {
  return api.put<Download>(`/download/${encodeURIComponent(id)}`, input);
}
export function deleteDownload(id: string) {
  return api.delete<void>(`/download/${encodeURIComponent(id)}`);
}
