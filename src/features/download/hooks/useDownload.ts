import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listDownload,
  createDownload,
  updateDownload,
  deleteDownload,
  type DownloadInput,
} from "@/lib/api/downloadApi";

const KEY = ["download"];

export function useDownloadList(search: string) {
  return useQuery({ queryKey: [...KEY, { search }], queryFn: () => listDownload(search) });
}

export function useCreateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DownloadInput) => createDownload(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DownloadInput }) => updateDownload(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDownload(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
