import { useQuery } from "@tanstack/react-query";
import { listContentPublic } from "@/lib/api/publicApi";

// Public hook: fetches all site content once and returns a getter with fallbacks.
export function useSiteContent() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["public", "content"],
    queryFn: listContentPublic,
    staleTime: 5 * 60 * 1000,
  });

  const map: Record<string, string> = {};
  for (const c of data) map[c.key] = c.value;

  // get(key, fallback): returns stored value, or the fallback if empty/missing.
  const get = (key: string, fallback = "") => {
    const v = map[key];
    return v && v.trim() !== "" ? v : fallback;
  };

  // getList(key, fallback[]): newline-separated value -> string[].
  const getList = (key: string, fallback: string[] = []) => {
    const v = map[key];
    if (!v || v.trim() === "") return fallback;
    return v.split("\n").map((s) => s.trim()).filter(Boolean);
  };

  return { get, getList, isLoading };
}
