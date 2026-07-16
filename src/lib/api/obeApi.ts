import { api } from "./client";

// ── Domain types (colocated with the API module, flow-connect convention) ──

export interface Curriculum {
  id: string;
  nama: string;
  tahun: string;
  nomor_sk: string;
  tanggal_berlaku: string;
  is_active: boolean;
  deskripsi: string;
  buku_url: string;
  struktur_url: string;
  created_at: string;
  updated_at: string;
}
export type CurriculumInput = Pick<
  Curriculum,
  "nama" | "tahun" | "nomor_sk" | "tanggal_berlaku" | "deskripsi" | "buku_url" | "struktur_url"
>;

export interface Course {
  id: string;
  curriculum_id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  deskripsi: string;
  rps_url: string;
  created_at: string;
  updated_at: string;
}
export type CourseInput = Pick<
  Course,
  "curriculum_id" | "kode" | "nama" | "sks" | "semester" | "deskripsi" | "rps_url"
>;

export type CplKategori = "sikap" | "pengetahuan" | "keterampilan_umum" | "keterampilan_khusus";

export interface CPL {
  id: string;
  curriculum_id: string;
  kode: string;
  deskripsi: string;
  kategori: CplKategori;
  created_at: string;
  updated_at: string;
}
export type CPLInput = Pick<CPL, "curriculum_id" | "kode" | "deskripsi" | "kategori">;

export interface CPMK {
  id: string;
  course_id: string;
  kode: string;
  deskripsi: string;
  level_bloom: string;
  target: string;
  created_at: string;
  updated_at: string;
}
export type CPMKInput = Pick<CPMK, "course_id" | "kode" | "deskripsi" | "level_bloom" | "target">;

export interface RPS {
  id: string;
  course_id: string;
  minggu: number;
  cpmk_id: string | null;
  materi: string;
  metode: string;
  assessment: string;
  created_at: string;
  updated_at: string;
}
export type RPSInput = Pick<RPS, "course_id" | "minggu" | "cpmk_id" | "materi" | "metode" | "assessment">;

export interface Link {
  cpl_id: string;
  cpmk_id: string;
}
export interface MappingMatrix {
  cpls: CPL[];
  cpmks: CPMK[];
  links: Link[];
}
export interface MappingSetInput {
  cpl_id: string;
  cpmk_id: string;
  linked: boolean;
}

export interface ObeStats {
  curriculum: Curriculum | null;
  course_count: number;
  cpl_count: number;
  cpmk_count: number;
  rps_count: number;
  total_sks: number;
  mapped_cpmk: number;
  mapping_progress: number; // 0..100
  courses_by_semester: Record<string, number>;
  cpl_by_kategori: Record<string, number>;
}

export interface PublicCourse extends Course {
  cpmks: CPMK[];
  cpl_codes: string[];
}
export interface ObePublicData {
  curriculum: Curriculum | null;
  cpls: CPL[];
  courses: PublicCourse[];
}

// ── Shared option lists / labels ──

export const CPL_KATEGORI: { value: CplKategori; label: string }[] = [
  { value: "sikap", label: "Sikap" },
  { value: "pengetahuan", label: "Pengetahuan" },
  { value: "keterampilan_umum", label: "Keterampilan Umum" },
  { value: "keterampilan_khusus", label: "Keterampilan Khusus" },
];
export const kategoriLabel = (v: string) => CPL_KATEGORI.find((k) => k.value === v)?.label ?? v;

export const BLOOM_LEVELS = ["C1", "C2", "C3", "C4", "C5", "C6"];
export const TOTAL_SEMESTER = 8;

// ── Curriculums ──
export const listCurriculums = () => api.get<Curriculum[]>("/obe/curriculums");
export const createCurriculum = (input: CurriculumInput) => api.post<Curriculum>("/obe/curriculums", input);
export const updateCurriculum = (id: string, input: CurriculumInput) =>
  api.put<Curriculum>(`/obe/curriculums/${encodeURIComponent(id)}`, input);
export const deleteCurriculum = (id: string) => api.delete<void>(`/obe/curriculums/${encodeURIComponent(id)}`);
export const activateCurriculum = (id: string) =>
  api.patch<Curriculum>(`/obe/curriculums/${encodeURIComponent(id)}/activate`);

// ── Courses ──
export function listCourses(curriculumId?: string, semester?: number) {
  const p = new URLSearchParams();
  if (curriculumId) p.set("curriculum_id", curriculumId);
  if (semester) p.set("semester", String(semester));
  const qs = p.toString();
  return api.get<Course[]>(`/obe/courses${qs ? `?${qs}` : ""}`);
}
export const createCourse = (input: CourseInput) => api.post<Course>("/obe/courses", input);
export const updateCourse = (id: string, input: CourseInput) =>
  api.put<Course>(`/obe/courses/${encodeURIComponent(id)}`, input);
export const deleteCourse = (id: string) => api.delete<void>(`/obe/courses/${encodeURIComponent(id)}`);

// ── CPL ──
export function listCpl(curriculumId?: string) {
  const qs = curriculumId ? `?curriculum_id=${encodeURIComponent(curriculumId)}` : "";
  return api.get<CPL[]>(`/obe/cpl${qs}`);
}
export const createCpl = (input: CPLInput) => api.post<CPL>("/obe/cpl", input);
export const updateCpl = (id: string, input: CPLInput) => api.put<CPL>(`/obe/cpl/${encodeURIComponent(id)}`, input);
export const deleteCpl = (id: string) => api.delete<void>(`/obe/cpl/${encodeURIComponent(id)}`);

// ── CPMK ──
export function listCpmk(params: { courseId?: string; curriculumId?: string }) {
  const p = new URLSearchParams();
  if (params.courseId) p.set("course_id", params.courseId);
  if (params.curriculumId) p.set("curriculum_id", params.curriculumId);
  const qs = p.toString();
  return api.get<CPMK[]>(`/obe/cpmk${qs ? `?${qs}` : ""}`);
}
export const createCpmk = (input: CPMKInput) => api.post<CPMK>("/obe/cpmk", input);
export const updateCpmk = (id: string, input: CPMKInput) => api.put<CPMK>(`/obe/cpmk/${encodeURIComponent(id)}`, input);
export const deleteCpmk = (id: string) => api.delete<void>(`/obe/cpmk/${encodeURIComponent(id)}`);

// ── RPS ──
export function listRps(courseId: string) {
  return api.get<RPS[]>(`/obe/rps?course_id=${encodeURIComponent(courseId)}`);
}
export const createRps = (input: RPSInput) => api.post<RPS>("/obe/rps", input);
export const updateRps = (id: string, input: RPSInput) => api.put<RPS>(`/obe/rps/${encodeURIComponent(id)}`, input);
export const deleteRps = (id: string) => api.delete<void>(`/obe/rps/${encodeURIComponent(id)}`);

// ── Mapping (CPL ↔ CPMK) ──
export function getMapping(curriculumId: string) {
  return api.get<MappingMatrix>(`/obe/mappings?curriculum_id=${encodeURIComponent(curriculumId)}`);
}
export const setMapping = (input: MappingSetInput) => api.put<{ ok: boolean }>("/obe/mappings", input);

// ── Stats ──
export function getObeStats(curriculumId?: string) {
  const qs = curriculumId ? `?curriculum_id=${encodeURIComponent(curriculumId)}` : "";
  return api.get<ObeStats>(`/obe/stats${qs}`);
}

// ── Public (no-auth) ──
export const getObePublic = () => api.get<ObePublicData>("/public/obe");
