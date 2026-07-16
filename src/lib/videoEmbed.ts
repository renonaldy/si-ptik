// Turns a stored promo-video URL (upload / YouTube / Google Drive) into
// something renderable: a native <video> source, an embeddable iframe URL
// (plus optional thumbnail), or an external link as the fallback.

export type VideoEmbed =
  | { kind: "file"; src: string } // uploaded file — native <video>
  | { kind: "iframe"; src: string; href: string; thumb?: string } // YouTube / GDrive file preview
  | { kind: "folder"; src: string; href: string } // GDrive folder — embedded list view
  | { kind: "link"; href: string }; // unrecognized URL — open in new tab

export function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export const youTubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

// Google Drive: file links (/file/d/<id>, open?id=<id>, uc?id=<id>) and
// folder links (/drive/folders/<id>). Content must be shared "anyone with the link".
export function parseGDrive(url: string): { kind: "file" | "folder"; id: string } | null {
  let m = url.match(/drive\.google\.com\/.*\/folders\/([\w-]+)/);
  if (m) return { kind: "folder", id: m[1] };
  m =
    url.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ??
    url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/);
  if (m) return { kind: "file", id: m[1] };
  return null;
}

export const gdriveThumb = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w640`;

export type FlyerMedia =
  | { kind: "image"; src: string; full: string; download: string } // src = grid thumb, full = lightbox
  | { kind: "folder"; src: string; href: string } // GDrive folder of flyers — embedded list view
  | { kind: "link"; href: string }; // unrecognized URL — open in new tab

// Flyers: an uploaded image, a GDrive image file, or a GDrive folder.
export function flyerMedia(media: string, sumber: string): FlyerMedia {
  if (!media) return { kind: "link", href: "" };
  if (sumber === "gdrive") {
    const g = parseGDrive(media);
    if (!g) return { kind: "link", href: media };
    if (g.kind === "folder") {
      return { kind: "folder", src: `https://drive.google.com/embeddedfolderview?id=${g.id}#grid`, href: media };
    }
    return {
      kind: "image",
      src: gdriveThumb(g.id),
      full: `https://drive.google.com/thumbnail?id=${g.id}&sz=w1600`,
      download: `https://drive.google.com/uc?export=download&id=${g.id}`,
    };
  }
  return { kind: "image", src: media, full: media, download: media }; // "upload"
}

export function videoEmbed(media: string, sumber: string): VideoEmbed {
  if (!media) return { kind: "link", href: "" };
  if (sumber === "youtube") {
    const id = parseYouTubeId(media);
    return id
      ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}`, href: media, thumb: youTubeThumb(id) }
      : { kind: "link", href: media };
  }
  if (sumber === "gdrive") {
    const g = parseGDrive(media);
    if (!g) return { kind: "link", href: media };
    return g.kind === "folder"
      ? { kind: "folder", src: `https://drive.google.com/embeddedfolderview?id=${g.id}#grid`, href: media }
      : { kind: "iframe", src: `https://drive.google.com/file/d/${g.id}/preview`, href: media, thumb: gdriveThumb(g.id) };
  }
  return { kind: "file", src: media }; // "upload"
}
