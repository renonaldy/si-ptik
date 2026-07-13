import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listAdministrasi,
  createAdministrasi,
  updateAdministrasi,
  deleteAdministrasi,
  type AdministrasiInput,
} from "@/lib/api/administrasiApi";

const KEY = ["administrasi"];

export function useAdministrasiList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listAdministrasi(search),
  });
}

export function useCreateAdministrasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdministrasiInput) => createAdministrasi(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateAdministrasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdministrasiInput }) => updateAdministrasi(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteAdministrasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdministrasi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
