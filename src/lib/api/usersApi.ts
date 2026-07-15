import { api } from "./client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface UpdateUserInput {
  email: string;
  full_name: string;
  role: string;
}

export function listUsers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return api.get<User[]>(`/users${qs}`);
}
export function createUser(input: CreateUserInput) {
  return api.post<User>("/users", input);
}
export function updateUser(id: string, input: UpdateUserInput) {
  return api.put<User>(`/users/${encodeURIComponent(id)}`, input);
}
export function resetUserPassword(id: string, password: string) {
  return api.put<void>(`/users/${encodeURIComponent(id)}/password`, { password });
}
export function deleteUser(id: string) {
  return api.delete<void>(`/users/${encodeURIComponent(id)}`);
}
