import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import { listDosen } from "@/lib/api/dosenApi";

interface DosenSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// A dropdown of dosen names (sourced from Data Dosen). Keeps a manually-set value
// selectable even if it's not in the current dosen list.
export function DosenSelect({ label, value, onChange }: DosenSelectProps) {
  const { data: dosen = [] } = useQuery({ queryKey: ["dosen", { search: "" }], queryFn: () => listDosen() });
  const names = dosen.map((d) => d.nama_dosen).filter(Boolean);
  const extra = value && !names.includes(value) ? [value] : [];

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— pilih dosen —</option>
        {[...names, ...extra].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
