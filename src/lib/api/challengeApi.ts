import { api } from "./client";

export type ChallengeStatus = "aktif" | "selesai";

// Reusable {icon, judul, keterangan} row used by the Tema, Aturan, Penilaian,
// and Hadiah section lists on the challenge detail (landing-page style) page.
export interface ChallengePoint {
  icon: string;
  judul: string;
  keterangan: string;
}

export interface Challenge {
  id: string;
  judul: string;
  deskripsi: string;
  poster: string;
  lampiran: string;
  link_daftar: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: ChallengeStatus;
  tema_subjudul: string;
  tema: ChallengePoint[];
  aturan: ChallengePoint[];
  penilaian: ChallengePoint[];
  penilaian_intro: string;
  hadiah: ChallengePoint[];
  hadiah_intro: string;
  hashtags: string[];
  caption_template: string;
  created_at: string;
  updated_at: string;
}

export type ChallengeInput = Omit<Challenge, "id" | "created_at" | "updated_at">;

export function listChallenge(search?: string, status?: ChallengeStatus | "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const qs = params.toString();
  return api.get<Challenge[]>(`/challenge${qs ? `?${qs}` : ""}`);
}
export function getChallenge(id: string) {
  return api.get<Challenge>(`/challenge/${encodeURIComponent(id)}`);
}
export function createChallenge(input: ChallengeInput) {
  return api.post<Challenge>("/challenge", input);
}
export function updateChallenge(id: string, input: ChallengeInput) {
  return api.put<Challenge>(`/challenge/${encodeURIComponent(id)}`, input);
}
export function deleteChallenge(id: string) {
  return api.delete<void>(`/challenge/${encodeURIComponent(id)}`);
}
