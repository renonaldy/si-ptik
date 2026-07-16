import { Label } from "@/components/ui/label";
import { NativeSelect } from "./NativeSelect";
import type { Curriculum } from "@/lib/api/obeApi";

interface CurriculumPickerProps {
  curriculums: Curriculum[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
  label?: string;
  className?: string;
}

// Labeled curriculum selector reused across the OBE admin pages. Marks the active one.
export function CurriculumPicker({
  curriculums,
  value,
  onChange,
  id = "obe-curriculum",
  label = "Kurikulum",
  className,
}: CurriculumPickerProps) {
  return (
    <div className={className}>
      {label && <Label htmlFor={id} className="mb-1.5 block">{label}</Label>}
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={curriculums.length === 0}>
        {curriculums.length === 0 && <option value="">— belum ada kurikulum —</option>}
        {curriculums.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nama} · {c.tahun || "—"}
            {c.is_active ? " (Aktif)" : ""}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
