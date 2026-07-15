import { api } from "./client";
import type { MenuKey } from "@/lib/menu";

// Per-account sidebar visibility + CRUD rights. Only configurable accounts
// (dosen, mahasiswa) have rows. write_keys is always a subset of menu_keys.
export interface UserMenu {
  user_id: string;
  menu_keys: MenuKey[];
  write_keys: MenuKey[];
  updated_at: string;
}

export interface UserMenuInput {
  user_id: string;
  menu_keys: MenuKey[];
  write_keys: MenuKey[];
}

// Admin config page: all configured accounts.
export function listMenuAccess() {
  return api.get<UserMenu[]>("/menu-access");
}

// Current account's own config — backs the sidebar / route guard / write checks.
export function getMyMenuAccess() {
  return api.get<UserMenu>("/menu-access/me");
}

export function saveMenuAccess(items: UserMenuInput[]) {
  return api.put<UserMenu[]>("/menu-access", { items });
}
