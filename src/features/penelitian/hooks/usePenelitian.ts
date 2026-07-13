import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listPenelitian,
  createPenelitian,
  updatePenelitian,
  deletePenelitian,
  type PenelitianInput,
} from "@/lib/api/penelitianApi";

const KEY = ["penelitian"];

export function usePenelitianList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listPenelitian(search),
  });
}

export function useCreatePenelitian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PenelitianInput) => createPenelitian(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdatePenelitian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PenelitianInput }) => updatePenelitian(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeletePenelitian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePenelitian(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
