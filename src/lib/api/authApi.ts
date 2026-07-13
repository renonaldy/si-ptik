import { api } from "./client";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export function login(email: string, password: string) {
  return api.post<TokenPair>("/auth/login", { email, password });
}

export function getMe() {
  return api.get<ApiUser>("/users/me");
}

export function logout(refreshToken: string) {
  return api.post<void>("/auth/logout", { refresh_token: refreshToken });
}
