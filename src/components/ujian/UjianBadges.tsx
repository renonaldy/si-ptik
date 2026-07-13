import { Badge } from "@/components/ui/badge";
import type { Ujian } from "@/lib/api/ujianApi";

const RANK: Record<string, number> = { akan: 0, sedang: 1, sudah: 2 };
const ORDER = ["akan", "sedang", "sudah"] as const;

// Status derived from the schedule vs now. It only moves the manual status
// FORWARD (akan -> sedang -> sudah), never backward — so an exam auto-becomes
// "Sedang Ujian" once its start time is reached, and "Sudah Ujian" after it ends.
export function effectiveStatus(u: Pick<Ujian, "tanggal" | "jam" | "jam_selesai" | "status">): string {
  const manual = RANK[u.status] ?? 0;
  let timeRank: number | null = null;
  if (u.tanggal && u.jam) {
    const start = new Date(`${u.tanggal}T${u.jam}`);
    if (!isNaN(start.getTime())) {
      const end = u.jam_selesai
        ? new Date(`${u.tanggal}T${u.jam_selesai}`)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const now = Date.now();
      timeRank = now < start.getTime() ? 0 : now < end.getTime() ? 1 : 2;
    }
  }
  const rank = timeRank === null ? manual : Math.max(manual, timeRank);
  return ORDER[rank];
}

export const jenisLabel = (j: string) => (j === "kompre" ? "Kompre" : "Sempro");
export const jenisLabelLong = (j: string) =>
  j === "kompre" ? "Ujian Komprehensif (Kompre)" : "Seminar Proposal (Sempro)";

export const statusLabel = (s: string) =>
  s === "sedang" ? "Sedang Ujian" : s === "sudah" ? "Sudah Ujian" : "Akan Ujian";

export function JenisBadge({ jenis }: { jenis: string }) {
  return <Badge variant="secondary">{jenisLabel(jenis)}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "sedang") {
    return <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">Sedang Ujian</Badge>;
  }
  if (status === "sudah") {
    return <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">Sudah Ujian</Badge>;
  }
  return <Badge variant="secondary">Akan Ujian</Badge>;
}
