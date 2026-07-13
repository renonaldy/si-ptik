import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listSempro,
  createSempro,
  updateSempro,
  deleteSempro,
  type SemproInput,
} from "@/lib/api/semproApi";

const KEY = ["sempro"];

export function useSemproList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listSempro(search),
  });
}

export function useCreateSempro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SemproInput) => createSempro(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateSempro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SemproInput }) => updateSempro(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteSempro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSempro(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
