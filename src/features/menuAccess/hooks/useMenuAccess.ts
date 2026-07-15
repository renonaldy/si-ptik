import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listMenuAccess, saveMenuAccess, type RoleMenuInput } from "@/lib/api/menuAccessApi";
import { getStoredToken } from "@/lib/api/client";

const MENU_ACCESS_KEY = ["menu-access"];

// Fetched by the sidebar (to filter for dosen/mahasiswa) and the admin config page.
export function useMenuAccessList() {
  return useQuery({
    queryKey: MENU_ACCESS_KEY,
    queryFn: listMenuAccess,
    enabled: !!getStoredToken(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveMenuAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: RoleMenuInput[]) => saveMenuAccess(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MENU_ACCESS_KEY });
      toast.success("Hak akses menu berhasil disimpan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan hak akses"),
  });
}
