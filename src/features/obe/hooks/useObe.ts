import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  activateCurriculum,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  listCpl,
  createCpl,
  updateCpl,
  deleteCpl,
  listCpmk,
  createCpmk,
  updateCpmk,
  deleteCpmk,
  listRps,
  createRps,
  updateRps,
  deleteRps,
  getMapping,
  setMapping,
  getObeStats,
  getObePublic,
  type CurriculumInput,
  type CourseInput,
  type CPLInput,
  type CPMKInput,
  type RPSInput,
  type MappingSetInput,
} from "@/lib/api/obeApi";

// Whole module shares one root key; any write invalidates it so stats/mapping/
// lists all refresh together (the module is small and tightly coupled).
const ROOT = ["obe"];

function useObeMutation<TArgs>(
  fn: (args: TArgs) => Promise<unknown>,
  okMsg: string,
  errMsg: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOT });
      toast.success(okMsg);
    },
    onError: (e: Error) => toast.error(e.message || errMsg),
  });
}

// ── Curriculums ──
export const useCurriculums = () =>
  useQuery({ queryKey: [...ROOT, "curriculums"], queryFn: listCurriculums });

export const useCreateCurriculum = () =>
  useObeMutation((input: CurriculumInput) => createCurriculum(input), "Kurikulum ditambahkan", "Gagal menambah kurikulum");
export const useUpdateCurriculum = () =>
  useObeMutation(
    ({ id, input }: { id: string; input: CurriculumInput }) => updateCurriculum(id, input),
    "Kurikulum diperbarui",
    "Gagal memperbarui kurikulum",
  );
export const useDeleteCurriculum = () =>
  useObeMutation((id: string) => deleteCurriculum(id), "Kurikulum dihapus", "Gagal menghapus kurikulum");
export const useActivateCurriculum = () =>
  useObeMutation((id: string) => activateCurriculum(id), "Kurikulum diaktifkan", "Gagal mengaktifkan kurikulum");

// ── Courses ──
export const useCourses = (curriculumId?: string, semester?: number) =>
  useQuery({
    queryKey: [...ROOT, "courses", { curriculumId, semester }],
    queryFn: () => listCourses(curriculumId, semester),
    enabled: !!curriculumId,
  });

export const useCreateCourse = () =>
  useObeMutation((input: CourseInput) => createCourse(input), "Mata kuliah ditambahkan", "Gagal menambah mata kuliah");
export const useUpdateCourse = () =>
  useObeMutation(
    ({ id, input }: { id: string; input: CourseInput }) => updateCourse(id, input),
    "Mata kuliah diperbarui",
    "Gagal memperbarui mata kuliah",
  );
export const useDeleteCourse = () =>
  useObeMutation((id: string) => deleteCourse(id), "Mata kuliah dihapus", "Gagal menghapus mata kuliah");

// ── CPL ──
export const useCpl = (curriculumId?: string) =>
  useQuery({
    queryKey: [...ROOT, "cpl", { curriculumId }],
    queryFn: () => listCpl(curriculumId),
    enabled: !!curriculumId,
  });

export const useCreateCpl = () =>
  useObeMutation((input: CPLInput) => createCpl(input), "CPL ditambahkan", "Gagal menambah CPL");
export const useUpdateCpl = () =>
  useObeMutation(
    ({ id, input }: { id: string; input: CPLInput }) => updateCpl(id, input),
    "CPL diperbarui",
    "Gagal memperbarui CPL",
  );
export const useDeleteCpl = () =>
  useObeMutation((id: string) => deleteCpl(id), "CPL dihapus", "Gagal menghapus CPL");

// ── CPMK ──
export const useCpmk = (params: { courseId?: string; curriculumId?: string }) =>
  useQuery({
    queryKey: [...ROOT, "cpmk", params],
    queryFn: () => listCpmk(params),
    enabled: !!(params.courseId || params.curriculumId),
  });

export const useCreateCpmk = () =>
  useObeMutation((input: CPMKInput) => createCpmk(input), "CPMK ditambahkan", "Gagal menambah CPMK");
export const useUpdateCpmk = () =>
  useObeMutation(
    ({ id, input }: { id: string; input: CPMKInput }) => updateCpmk(id, input),
    "CPMK diperbarui",
    "Gagal memperbarui CPMK",
  );
export const useDeleteCpmk = () =>
  useObeMutation((id: string) => deleteCpmk(id), "CPMK dihapus", "Gagal menghapus CPMK");

// ── RPS ──
export const useRps = (courseId?: string) =>
  useQuery({
    queryKey: [...ROOT, "rps", { courseId }],
    queryFn: () => listRps(courseId as string),
    enabled: !!courseId,
  });

export const useCreateRps = () =>
  useObeMutation((input: RPSInput) => createRps(input), "Baris RPS ditambahkan", "Gagal menambah RPS");
export const useUpdateRps = () =>
  useObeMutation(
    ({ id, input }: { id: string; input: RPSInput }) => updateRps(id, input),
    "RPS diperbarui",
    "Gagal memperbarui RPS",
  );
export const useDeleteRps = () =>
  useObeMutation((id: string) => deleteRps(id), "Baris RPS dihapus", "Gagal menghapus RPS");

// ── Mapping ──
export const useMapping = (curriculumId?: string) =>
  useQuery({
    queryKey: [...ROOT, "mapping", { curriculumId }],
    queryFn: () => getMapping(curriculumId as string),
    enabled: !!curriculumId,
  });
export const useSetMapping = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MappingSetInput) => setMapping(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOT }),
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan mapping"),
  });
};

// ── Stats ──
export const useObeStats = (curriculumId?: string) =>
  useQuery({ queryKey: [...ROOT, "stats", { curriculumId }], queryFn: () => getObeStats(curriculumId) });

// ── Public (no-auth) — active curriculum full tree ──
export const useObePublic = () =>
  useQuery({ queryKey: ["public", "obe"], queryFn: getObePublic, staleTime: 5 * 60 * 1000 });
