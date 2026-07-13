import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listWisudawan,
  createWisudawan,
  updateWisudawan,
  deleteWisudawan,
  type WisudawanInput,
} from "@/lib/api/wisudawanApi";

const KEY = ["wisudawan"];

export function useWisudawanList(search: string) {
  return useQuery({
    queryKey: [...KEY, { search }],
    queryFn: () => listWisudawan(search),
  });
}

export function useCreateWisudawan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WisudawanInput) => createWisudawan(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateWisudawan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WisudawanInput }) => updateWisudawan(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil diperbarui");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteWisudawan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWisudawan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Data berhasil dihapus");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
