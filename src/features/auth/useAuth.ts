import { useMutation } from "@tanstack/react-query";
import { login as loginApi, logout as logoutApi } from "@/lib/api/authApi";
import { setTokens, clearTokens, getStoredToken, getRefreshToken } from "@/lib/api/client";

export { getStoredToken };

// Revoke the refresh token server-side (best-effort), then clear + redirect.
export async function logout() {
  const refresh = getRefreshToken();
  try {
    if (refresh) await logoutApi(refresh);
  } catch {
    // ignore network errors on logout
  }
  clearTokens();
  window.location.href = "/login";
}

// useLogin runs the credential exchange and persists the returned token pair.
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginApi(email, password),
    onSuccess: (pair) => {
      setTokens(pair.access_token, pair.refresh_token);
    },
  });
}
