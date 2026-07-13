import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listPendaftaran,
  createPendaftaran,
  updatePendaftaran,
  deletePendaftaran,
  type PendaftaranInput,
} from "@/lib/api/pendaftaranApi";

const KEY = ["pendaftaran"];

export function usePendaftaranList(search: string) {
  return useQuery({ queryKey: [...KEY, { search }], queryFn: () => listPendaftaran(search) });
}

export function useCreatePendaftaran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PendaftaranInput) => createPendaftaran(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdatePendaftaran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PendaftaranInput }) => updatePendaftaran(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeletePendaftaran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePendaftaran(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
