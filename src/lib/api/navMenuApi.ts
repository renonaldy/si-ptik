import { api } from "./client";

export type NavItemType = "link" | "dropdown";

// A dropdown's child entry (only meaningful when NavMenuItem.type === "dropdown").
export interface NavLeaf {
  label: string;
  to: string;
  external: boolean;
}

export interface NavMenuItem {
  id: string;
  type: NavItemType;
  label: string;
  // Route for type="link"; active-highlight prefix ("base") for type="dropdown".
  path: string;
  external: boolean;
  items: NavLeaf[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type NavMenuInput = Omit<NavMenuItem, "id" | "order_index" | "created_at" | "updated_at">;

export function listNavMenu() {
  return api.get<NavMenuItem[]>("/nav-menu");
}
export function getNavMenuItem(id: string) {
  return api.get<NavMenuItem>(`/nav-menu/${encodeURIComponent(id)}`);
}
export function createNavMenuItem(input: NavMenuInput) {
  return api.post<NavMenuItem>("/nav-menu", input);
}
export function updateNavMenuItem(id: string, input: NavMenuInput) {
  return api.put<NavMenuItem>(`/nav-menu/${encodeURIComponent(id)}`, input);
}
export function deleteNavMenuItem(id: string) {
  return api.delete<void>(`/nav-menu/${encodeURIComponent(id)}`);
}
export function reorderNavMenu(ids: string[]) {
  return api.put<void>("/nav-menu/reorder", { ids });
}
