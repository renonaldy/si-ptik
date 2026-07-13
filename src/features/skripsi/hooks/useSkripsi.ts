import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listSkripsi,
  createSkripsi,
  updateSkripsi,
  deleteSkripsi,
  type SkripsiInput,
} from "@/lib/api/skripsiApi";

const KEY = ["skripsi"];

export function useSkripsiList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listSkripsi(search),
  });
}

export function useCreateSkripsi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkripsiInput) => createSkripsi(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateSkripsi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SkripsiInput }) => updateSkripsi(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteSkripsi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkripsi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
