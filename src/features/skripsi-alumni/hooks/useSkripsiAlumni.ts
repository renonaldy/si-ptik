import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listSkripsiAlumni,
  createSkripsiAlumni,
  updateSkripsiAlumni,
  deleteSkripsiAlumni,
  type SkripsiAlumniInput,
} from "@/lib/api/skripsiAlumniApi";

const KEY = ["skripsi-alumni"];

export function useSkripsiAlumniList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listSkripsiAlumni(search),
  });
}

export function useCreateSkripsiAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkripsiAlumniInput) => createSkripsiAlumni(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateSkripsiAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SkripsiAlumniInput }) => updateSkripsiAlumni(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteSkripsiAlumni() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkripsiAlumni(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
