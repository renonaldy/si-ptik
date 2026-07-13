import { useRef, useState } from "react";
import { Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/api/uploadApi";

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** e.g. ".pdf,.docx" — restricts the picker and validates the chosen file. */
  accept?: string;
  /** small helper text under the field (e.g. "Format: PDF atau DOCX"). */
  hint?: string;
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx",
  hint,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Guard by extension against the accept list.
    const allowed = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (allowed.length && !allowed.includes(ext)) {
      toast.error(`Format tidak didukung. ${hint ?? "Diizinkan: " + allowed.join(", ")}`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const res = await uploadFile(file);
      onChange(res.url);
      toast.success("File berhasil diunggah");
    } catch (err) {
      toast.error((err as Error).message || "Gagal mengunggah file");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL file atau unggah…" />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {value && (
        <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="h-3 w-3" /> Lihat file
        </a>
      )}
      <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onFile} />
    </div>
  );
}
