import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listMicrosoft,
  createMicrosoft,
  updateMicrosoft,
  deleteMicrosoft,
  type MicrosoftInput,
} from "@/lib/api/microsoftApi";

const KEY = ["microsoft"];

export function useMicrosoftList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listMicrosoft(search),
  });
}

export function useCreateMicrosoft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MicrosoftInput) => createMicrosoft(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateMicrosoft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MicrosoftInput }) => updateMicrosoft(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteMicrosoft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMicrosoft(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
