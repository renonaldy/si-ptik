import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Smoothly scrolls to the element matching the URL hash (e.g. /profil#akreditasi).
// `ready` lets a page defer scrolling until async content has rendered.
export function useHashScroll(ready = true) {
  const { hash } = useLocation();
  useEffect(() => {
    if (!ready || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return;
    const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [hash, ready]);
}
