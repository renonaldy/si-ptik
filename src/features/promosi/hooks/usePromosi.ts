import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listPromosi,
  createPromosi,
  updatePromosi,
  deletePromosi,
  type PromosiInput,
  type PromosiTipe,
} from "@/lib/api/promosiApi";

const KEY = ["promosi"];

export function usePromosiList(search: string, tipe: PromosiTipe | "") {
  return useQuery({ queryKey: [...KEY, { search, tipe }], queryFn: () => listPromosi(search, tipe) });
}

export function useCreatePromosi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PromosiInput) => createPromosi(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdatePromosi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PromosiInput }) => updatePromosi(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeletePromosi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromosi(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
