import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listSumbangan,
  createSumbangan,
  updateSumbangan,
  deleteSumbangan,
  type SumbanganInput,
} from "@/lib/api/sumbanganApi";

const KEY = ["sumbangan"];

export function useSumbanganList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listSumbangan(search),
  });
}

export function useCreateSumbangan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SumbanganInput) => createSumbangan(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateSumbangan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SumbanganInput }) => updateSumbangan(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteSumbangan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSumbangan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
