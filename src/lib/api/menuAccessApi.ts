import { api } from "./client";
import type { MenuKey } from "@/lib/menu";

// Per-role sidebar visibility + CRUD rights. Only configurable roles
// (dosen, mahasiswa) have rows. write_keys is always a subset of menu_keys.
export interface RoleMenu {
  role: string;
  menu_keys: MenuKey[];
  write_keys: MenuKey[];
  updated_at: string;
}

export interface RoleMenuInput {
  role: string;
  menu_keys: MenuKey[];
  write_keys: MenuKey[];
}

export function listMenuAccess() {
  return api.get<RoleMenu[]>("/menu-access");
}

export function saveMenuAccess(items: RoleMenuInput[]) {
  return api.put<RoleMenu[]>("/menu-access", { items });
}
