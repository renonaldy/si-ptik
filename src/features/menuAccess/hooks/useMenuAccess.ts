import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listMenuAccess,
  getMyMenuAccess,
  saveMenuAccess,
  type UserMenuInput,
} from "@/lib/api/menuAccessApi";
import { getStoredToken } from "@/lib/api/client";

const MENU_ACCESS_KEY = ["menu-access"];
const MY_MENU_ACCESS_KEY = ["menu-access", "me"];

// Current account's own config — used by the sidebar, route guard, and write checks.
export function useMyMenuAccess() {
  return useQuery({
    queryKey: MY_MENU_ACCESS_KEY,
    queryFn: getMyMenuAccess,
    enabled: !!getStoredToken(),
    staleTime: 5 * 60 * 1000,
  });
}

// Full list of configured accounts — used by the admin "Hak Akses Menu" page.
export function useMenuAccessList() {
  return useQuery({
    queryKey: MENU_ACCESS_KEY,
    queryFn: listMenuAccess,
    enabled: !!getStoredToken(),
  });
}

export function useSaveMenuAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: UserMenuInput[]) => saveMenuAccess(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MENU_ACCESS_KEY });
      qc.invalidateQueries({ queryKey: MY_MENU_ACCESS_KEY });
      toast.success("Hak akses menu berhasil disimpan");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan hak akses"),
  });
}
