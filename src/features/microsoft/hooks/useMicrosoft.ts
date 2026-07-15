import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listMicrosoft,
  createMicrosoft,
  updateMicrosoft,
  updateMicrosoftStatus,
  deleteMicrosoft,
  type MicrosoftInput,
  type MicrosoftStatus,
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

export function useUpdateMicrosoftStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MicrosoftStatus }) => updateMicrosoftStatus(id, status),
    onSuccess: (_data, { status }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(
        status === "approved" ? "Pendaftaran disetujui" : status === "rejected" ? "Pendaftaran ditolak" : "Status diperbarui",
      );
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui status"),
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
