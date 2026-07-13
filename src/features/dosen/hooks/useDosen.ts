import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listDosen,
  createDosen,
  updateDosen,
  deleteDosen,
  type DosenInput,
} from "@/lib/api/dosenApi";

const DOSEN_KEY = ["dosen"];

// useDosenList queries the dosen collection (optionally filtered by search).
export function useDosenList(search: string) {
  return useQuery({
    queryKey: [...DOSEN_KEY, { search }],
    queryFn: () => listDosen(search),
  });
}

export function useCreateDosen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DosenInput) => createDosen(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOSEN_KEY });
      toast.success("Dosen berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan dosen"),
  });
}

export function useUpdateDosen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DosenInput }) => updateDosen(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOSEN_KEY });
      toast.success("Data dosen berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui dosen"),
  });
}

export function useDeleteDosen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDosen(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOSEN_KEY });
      toast.success("Dosen berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus dosen"),
  });
}
