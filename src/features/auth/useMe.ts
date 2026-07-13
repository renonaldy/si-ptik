import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/authApi";
import { getStoredToken } from "@/lib/api/client";

// useMe backs the auth guard: null token -> no query; error -> guard logs out.
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!getStoredToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
