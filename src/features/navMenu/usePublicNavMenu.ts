import { useQuery } from "@tanstack/react-query";

import { listNavMenuPublic } from "@/lib/api/publicApi";
import type { NavMenuItem } from "@/lib/api/navMenuApi";

// Shape consumed by PublicLayout's navbar (top-level link, or a dropdown with leaves).
export type NavLeaf = { label: string; to: string; external?: boolean };
export type NavEntry =
  | { type: "link"; label: string; to: string; external?: boolean }
  | { type: "dropdown"; label: string; base: string; items: NavLeaf[] };

function toNavEntries(items: NavMenuItem[]): NavEntry[] {
  return items.map((i) =>
    i.type === "dropdown"
      ? {
          type: "dropdown",
          label: i.label,
          base: i.path,
          items: i.items.map((l) => ({ label: l.label, to: l.to, external: l.external })),
        }
      : { type: "link", label: i.label, to: i.path, external: i.external },
  );
}

// Public hook: fetches the admin-managed navbar. Falls back to `defaultNav`
// (the site's previous hardcoded array) whenever the API list is still
// loading, empty, or unavailable — same "never break the navbar" fallback
// rule used by the site-content CMS (see useSiteContent.ts).
export function usePublicNavMenu(defaultNav: NavEntry[]) {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "nav-menu"],
    queryFn: listNavMenuPublic,
    staleTime: 5 * 60 * 1000,
  });

  const nav = data && data.length > 0 ? toNavEntries(data) : defaultNav;
  return { nav, isLoading };
}
