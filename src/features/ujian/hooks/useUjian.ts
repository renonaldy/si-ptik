import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listUjian, createUjian, updateUjian, deleteUjian, type UjianInput } from "@/lib/api/ujianApi";

const KEY = ["ujian"];

export function useUjianList(search: string) {
  return useQuery({ queryKey: [...KEY, { search }], queryFn: () => listUjian(search) });
}

export function useCreateUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UjianInput) => createUjian(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["public", "ujian"] });
      toast.success("Jadwal ujian ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UjianInput }) => updateUjian(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["public", "ujian"] });
      toast.success("Jadwal ujian diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteUjian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUjian(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["public", "ujian"] });
      toast.success("Jadwal ujian dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
