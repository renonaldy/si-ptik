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
  threshold: number; // default attainment threshold (%) for the achievement engine
  created_at: string;
  updated_at: string;
}
export type CurriculumInput = Pick<
  Curriculum,
  "nama" | "tahun" | "nomor_sk" | "tanggal_berlaku" | "deskripsi" | "buku_url" | "struktur_url" | "threshold"
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

// ════════════════════ Assessment & Achievement ════════════════════

// Indikator Kinerja (IK) — child of a CPL.
export interface Indicator {
  id: string;
  cpl_id: string;
  kode: string;
  deskripsi: string;
  created_at: string;
  updated_at: string;
}
export type IndicatorInput = Pick<Indicator, "cpl_id" | "kode" | "deskripsi">;

export interface Class {
  id: string;
  course_id: string;
  nama: string;
  tahun_akademik: string;
  periode: string; // ganjil | genap
  dosen_id: string | null;
  dosen_nama: string;
  created_at: string;
  updated_at: string;
}
export type ClassInput = Pick<Class, "course_id" | "nama" | "tahun_akademik" | "periode" | "dosen_id">;

export interface ClassStudent {
  id: string;
  class_id: string;
  npm: string;
  nama: string;
  created_at: string;
  updated_at: string;
}
export type ClassStudentInput = Pick<ClassStudent, "class_id" | "npm" | "nama">;

export interface Assessment {
  id: string;
  course_id: string;
  nama: string;
  jenis: string;
  bobot: number; // percent
  semester: string;
  tahun_akademik: string;
  created_at: string;
  updated_at: string;
}
export type AssessmentInput = Pick<
  Assessment,
  "course_id" | "nama" | "jenis" | "bobot" | "semester" | "tahun_akademik"
>;

export const ASSESSMENT_JENIS: { value: string; label: string }[] = [
  { value: "tugas", label: "Tugas" },
  { value: "quiz", label: "Quiz" },
  { value: "praktikum", label: "Praktikum" },
  { value: "project", label: "Project" },
  { value: "uts", label: "UTS" },
  { value: "uas", label: "UAS" },
  { value: "presentasi", label: "Presentasi" },
];
export const jenisAssessmentLabel = (v: string) =>
  ASSESSMENT_JENIS.find((j) => j.value === v)?.label ?? v;

export interface AssessmentLink {
  assessment_id: string;
  cpmk_id: string;
}
export interface AssessmentMappingMatrix {
  assessments: Assessment[];
  cpmks: CPMK[];
  links: AssessmentLink[];
}

export interface IKLink {
  ik_id: string;
  cpmk_id: string;
}
export interface IKMappingMatrix {
  iks: Indicator[];
  cpls: CPL[];
  cpmks: CPMK[];
  links: IKLink[];
}

export interface ScoreCell {
  student_id: string;
  assessment_id: string;
  score: number;
}
export interface ScoreMatrix {
  class: Class;
  students: ClassStudent[];
  assessments: Assessment[];
  scores: ScoreCell[];
  bobot_total: number;
}

export interface ResultRow {
  ref_id: string;
  nilai: number;
  status: "tercapai" | "belum_tercapai";
}
export interface StudentResults {
  student: ClassStudent;
  cpmk: ResultRow[];
  cpl: ResultRow[];
  ik: ResultRow[];
}
export interface AggRow {
  ref_id: string;
  nilai: number;
  tercapai: number;
  dinilai: number;
}
export interface ClassResults {
  class: Class;
  course: Course;
  threshold: number;
  bobot_total: number;
  cpmks: CPMK[];
  cpls: CPL[];
  iks: Indicator[];
  students: StudentResults[];
  class_cpmk: AggRow[];
  class_cpl: AggRow[];
  class_ik: AggRow[];
}

// ── Indicators (IK) ──
export function listIndicators(params: { curriculumId?: string; cplId?: string }) {
  const p = new URLSearchParams();
  if (params.curriculumId) p.set("curriculum_id", params.curriculumId);
  if (params.cplId) p.set("cpl_id", params.cplId);
  const qs = p.toString();
  return api.get<Indicator[]>(`/obe/indicators${qs ? `?${qs}` : ""}`);
}
export const createIndicator = (input: IndicatorInput) => api.post<Indicator>("/obe/indicators", input);
export const updateIndicator = (id: string, input: IndicatorInput) =>
  api.put<Indicator>(`/obe/indicators/${encodeURIComponent(id)}`, input);
export const deleteIndicator = (id: string) => api.delete<void>(`/obe/indicators/${encodeURIComponent(id)}`);

// ── IK ↔ CPMK mapping ──
export const getIkMapping = (curriculumId: string) =>
  api.get<IKMappingMatrix>(`/obe/ik-mappings?curriculum_id=${encodeURIComponent(curriculumId)}`);
export const setIkMapping = (input: { ik_id: string; cpmk_id: string; linked: boolean }) =>
  api.put<{ ok: boolean }>("/obe/ik-mappings", input);

// ── Classes ──
export function listClasses(params: { courseId?: string; curriculumId?: string }) {
  const p = new URLSearchParams();
  if (params.courseId) p.set("course_id", params.courseId);
  if (params.curriculumId) p.set("curriculum_id", params.curriculumId);
  const qs = p.toString();
  return api.get<Class[]>(`/obe/classes${qs ? `?${qs}` : ""}`);
}
export const createClass = (input: ClassInput) => api.post<Class>("/obe/classes", input);
export const updateClass = (id: string, input: ClassInput) =>
  api.put<Class>(`/obe/classes/${encodeURIComponent(id)}`, input);
export const deleteClass = (id: string) => api.delete<void>(`/obe/classes/${encodeURIComponent(id)}`);

// ── Class roster (di bawah /obe-nilai — dosen dapat diberi hak tulis) ──
export const listClassStudents = (classId: string) =>
  api.get<ClassStudent[]>(`/obe-nilai/students?class_id=${encodeURIComponent(classId)}`);
export const createClassStudent = (input: ClassStudentInput) =>
  api.post<ClassStudent>("/obe-nilai/students", input);
export const createClassStudentsBulk = (classId: string, students: { npm: string; nama: string }[]) =>
  api.post<{ inserted: number }>("/obe-nilai/students/bulk", { class_id: classId, students });
export const updateClassStudent = (id: string, input: ClassStudentInput) =>
  api.put<ClassStudent>(`/obe-nilai/students/${encodeURIComponent(id)}`, input);
export const deleteClassStudent = (id: string) =>
  api.delete<void>(`/obe-nilai/students/${encodeURIComponent(id)}`);

// ── Assessments ──
export const listAssessments = (courseId: string) =>
  api.get<Assessment[]>(`/obe/assessments?course_id=${encodeURIComponent(courseId)}`);
export const createAssessment = (input: AssessmentInput) => api.post<Assessment>("/obe/assessments", input);
export const updateAssessment = (id: string, input: AssessmentInput) =>
  api.put<Assessment>(`/obe/assessments/${encodeURIComponent(id)}`, input);
export const deleteAssessment = (id: string) =>
  api.delete<void>(`/obe/assessments/${encodeURIComponent(id)}`);

// ── Assessment ↔ CPMK mapping ──
export const getAssessmentMapping = (courseId: string) =>
  api.get<AssessmentMappingMatrix>(`/obe/assessment-mappings?course_id=${encodeURIComponent(courseId)}`);
export const setAssessmentMapping = (input: { assessment_id: string; cpmk_id: string; linked: boolean }) =>
  api.put<{ ok: boolean }>("/obe/assessment-mappings", input);

// ── Scores ──
export const getScoreMatrix = (classId: string) =>
  api.get<ScoreMatrix>(`/obe-nilai/matrix?class_id=${encodeURIComponent(classId)}`);
export const saveScores = (classId: string, scores: ScoreCell[]) =>
  api.put<{ ok: boolean }>("/obe-nilai/scores", { class_id: classId, scores });

// ── Achievement results ──
export const getClassResults = (classId: string) =>
  api.get<ClassResults>(`/obe/results?class_id=${encodeURIComponent(classId)}`);
