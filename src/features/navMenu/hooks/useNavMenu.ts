import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listNavMenu,
  createNavMenuItem,
  updateNavMenuItem,
  deleteNavMenuItem,
  reorderNavMenu,
  type NavMenuInput,
} from "@/lib/api/navMenuApi";

const KEY = ["nav-menu"];

export function useNavMenuList() {
  return useQuery({ queryKey: KEY, queryFn: listNavMenu });
}

export function useCreateNavMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NavMenuInput) => createNavMenuItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Menu berhasil ditambahkan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan menu"),
  });
}

export function useUpdateNavMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NavMenuInput }) => updateNavMenuItem(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Menu berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui menu"),
  });
}

export function useDeleteNavMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNavMenuItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Menu berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus menu"),
  });
}

export function useReorderNavMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderNavMenu(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah urutan menu"),
  });
}
