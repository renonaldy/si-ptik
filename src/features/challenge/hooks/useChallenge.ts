import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  type ChallengeInput,
  type ChallengeStatus,
} from "@/lib/api/challengeApi";

const KEY = ["challenge"];

export function useChallengeList(search: string, status: ChallengeStatus | "") {
  return useQuery({ queryKey: [...KEY, { search, status }], queryFn: () => listChallenge(search, status) });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChallengeInput) => createChallenge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan data"),
  });
}

export function useUpdateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChallengeInput }) => updateChallenge(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui data"),
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChallenge(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Data berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus data"),
  });
}
