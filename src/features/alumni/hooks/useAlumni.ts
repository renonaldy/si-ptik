import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listAlumni,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  type AlumniInput,
} from "@/lib/api/alumniApi";

const ALUMNI_KEY = ["alumni"];

export function useAlumniList(search: string) {
  return useQuery({
    queryKey: [...ALUMNI_KEY, { search }],
    queryFn: () => listAlumni(search),
  });
}

export function useCreateAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AlumniInput) => createAlumni(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALUMNI_KEY });
      toast.success("Alumni berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan alumni"),
  });
}

export function useUpdateAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AlumniInput }) => updateAlumni(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALUMNI_KEY });
      toast.success("Data alumni berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui alumni"),
  });
}

export function useDeleteAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlumni(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALUMNI_KEY });
      toast.success("Alumni berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus alumni"),
  });
}
