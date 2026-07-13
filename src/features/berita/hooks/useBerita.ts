import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listBerita,
  createBerita,
  updateBerita,
  deleteBerita,
  type BeritaInput,
} from "@/lib/api/beritaApi";

const KEY = ["berita"];

export function useBeritaList(search: string) {
  return useQuery({ queryKey: [...KEY, { search }], queryFn: () => listBerita(search) });
}

export function useCreateBerita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BeritaInput) => createBerita(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateBerita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BeritaInput }) => updateBerita(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteBerita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBerita(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
