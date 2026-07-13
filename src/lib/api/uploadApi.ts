import { API_BASE } from "./config";
import { TOKEN_KEY } from "./client";

export interface UploadResult {
  url: string;
  filename: string;
}

// Uploads a single file via multipart/form-data and returns its public URL.
export async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ""}` },
    body: fd,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Gagal mengunggah file");
  }
  return body.data as UploadResult;
}
