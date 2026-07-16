import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObeFormDialog } from "./ObeFormDialog";
import type { ClassStudent, ClassStudentInput } from "@/lib/api/obeApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ClassStudent | null;
  classId: string;
  onSubmit: (input: ClassStudentInput) => void;
  onSubmitBulk: (students: { npm: string; nama: string }[]) => void;
  isPending: boolean;
}

// Parses pasted roster lines: "NPM<TAB>Nama", "NPM;Nama", "NPM,Nama", or just "Nama".
function parseBulk(text: string): { npm: string; nama: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.split(/[\t;,]+/).map((s) => s.trim()).filter(Boolean);
      if (m.length >= 2) return { npm: m[0], nama: m.slice(1).join(" ") };
      // Single column: treat a leading digit-string as NPM-less name vs npm-only.
      return /^\d{6,}$/.test(line) ? { npm: line, nama: line } : { npm: "", nama: line };
    });
}

export function StudentFormDialog({ open, onOpenChange, initial, classId, onSubmit, onSubmitBulk, isPending }: Props) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState<ClassStudentInput>({ class_id: classId, npm: "", nama: "" });
  const [bulkText, setBulkText] = useState("");

  useEffect(() => {
    if (open) {
      setMode("single");
      setBulkText("");
      setForm(
        initial
          ? { class_id: initial.class_id, npm: initial.npm, nama: initial.nama }
          : { class_id: classId, npm: "", nama: "" },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const bulkRows = parseBulk(bulkText);
  const canSubmit = mode === "single" ? form.nama.trim().length > 0 : bulkRows.length > 0;

  return (
    <ObeFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={UserPlus}
      title={initial ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
      description={initial ? "Perbarui data mahasiswa." : "Tambahkan mahasiswa ke roster kelas."}
      onSubmit={() => {
        if (mode === "single") onSubmit({ ...form, class_id: initial ? form.class_id : classId });
        else onSubmitBulk(bulkRows);
      }}
      isPending={isPending}
      canSubmit={canSubmit}
    >
      {!initial && (
        <div className="flex gap-2">
          {(["single", "bulk"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "border-[hsl(var(--ma))] bg-[hsl(var(--ma)/0.1)] text-[hsl(var(--ma))]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "single" ? "Satu mahasiswa" : "Tempel daftar (bulk)"}
            </button>
          ))}
        </div>
      )}

      {mode === "single" || initial ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="stu-npm">NPM</Label>
            <Input id="stu-npm" value={form.npm} onChange={(e) => setForm((f) => ({ ...f, npm: e.target.value }))} placeholder="1810013231009" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stu-nama">Nama <span className="text-destructive">*</span></Label>
            <Input id="stu-nama" value={form.nama} autoFocus onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="stu-bulk">Daftar Mahasiswa</Label>
          <Textarea
            id="stu-bulk"
            rows={8}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Satu mahasiswa per baris — NPM lalu Nama, dipisah TAB / ; / ,\ncontoh:\n1810013231009\tRizky Pratama\n1810013231010;Putri Amanda"}
          />
          <p className="text-xs text-muted-foreground">
            {bulkRows.length} baris terbaca. NPM yang sudah terdaftar di kelas akan dilewati otomatis.
          </p>
        </div>
      )}
    </ObeFormDialog>
  );
}
