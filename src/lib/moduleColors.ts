import type { CSSProperties } from "react";

// Per-domain accent hues. These are CONTENT-level colors only (icon tiles, bars,
// donut slices, keylines) — the app chrome stays violet (--primary).
export type ModuleKey =
  | "dosen"
  | "alumni"
  | "penelitian"
  | "skripsi"
  | "skripsi-alumni"
  | "sempro"
  | "wisudawan"
  | "administrasi"
  | "sumbangan"
  | "microsoft"
  | "berita"
  | "galeri"
  | "promosi"
  | "download"
  | "pendaftaran"
  | "ujian"
  | "obe";

export const MODULE_VAR: Record<ModuleKey, string> = {
  dosen: "--m-dosen",
  alumni: "--m-alumni",
  penelitian: "--m-penelitian",
  skripsi: "--m-skripsi",
  "skripsi-alumni": "--m-skripsi-alumni",
  sempro: "--m-sempro",
  wisudawan: "--m-wisudawan",
  administrasi: "--m-administrasi",
  sumbangan: "--m-sumbangan",
  microsoft: "--m-microsoft",
  berita: "--m-berita",
  galeri: "--m-galeri",
  promosi: "--m-promosi",
  download: "--m-download",
  pendaftaran: "--m-pendaftaran",
  ujian: "--m-ujian",
  obe: "--m-obe",
};

// Hue-interleaved order so adjacent chart marks separate well.
export const CHART_ORDER: ModuleKey[] = [
  "dosen",
  "sempro",
  "penelitian",
  "administrasi",
  "skripsi",
  "alumni",
  "wisudawan",
  "sumbangan",
  "skripsi-alumni",
  "microsoft",
];

// "var(--m-dosen)" — for direct hsl(...) use.
export const accentVar = (k: ModuleKey) => `var(${MODULE_VAR[k]})`;

// Set --ma ONCE on a wrapper; children read hsl(var(--ma) / x). NOTE: the variable
// is --ma (NOT --accent, which is already a live design token).
export const accentStyle = (k: ModuleKey): CSSProperties =>
  ({ ["--ma" as string]: `var(${MODULE_VAR[k]})` } as CSSProperties);
