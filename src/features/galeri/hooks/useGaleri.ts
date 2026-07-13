import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listGaleri,
  createGaleri,
  updateGaleri,
  deleteGaleri,
  type GaleriInput,
} from "@/lib/api/galeriApi";

const KEY = ["galeri"];

export function useGaleriList(search: string) {
  return useQuery({ queryKey: [...KEY, { search }], queryFn: () => listGaleri(search) });
}

export function useCreateGaleri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GaleriInput) => createGaleri(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateGaleri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GaleriInput }) => updateGaleri(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteGaleri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGaleri(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
