import logoUrl from "@/assets/logo.png";
import { cn } from "@/lib/utils";

/**
 * The Program Studi PTIK / Universitas Bung Hatta brand mark.
 * Single source for the logo used across all chrome (sidebar, public header,
 * footer, login). The logo PNG has a transparent background, so render it
 * directly — no gradient tile behind it.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Logo Universitas Bung Hatta — Program Studi PTIK"
      className={cn("object-contain", className)}
      loading="eager"
      decoding="async"
    />
  );
}
