import { useMe } from "@/features/auth/useMe";
import { useMenuAccessList } from "@/features/menuAccess/hooks/useMenuAccess";
import { canManage } from "@/features/auth/permissions";
import type { MenuKey } from "@/lib/menu";

// Whether the current user may CRUD (create/update/delete) the given menu.
// super_admin/admin always can; dosen/mahasiswa only if granted write access to
// that menu in the Hak Akses Menu config. Mirrors the backend CRUDGuard.
export function useCanWrite(menu: MenuKey): boolean {
  const { data: me } = useMe();
  const { data: access = [] } = useMenuAccessList();
  if (canManage(me?.role)) return true;
  const writeKeys = access.find((a) => a.role === me?.role)?.write_keys ?? [];
  return writeKeys.includes(menu);
}
