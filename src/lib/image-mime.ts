/** Đuôi từ sniff/MIME → MIME cho data URL (data:image/...;base64,...). */
export function mimeFromExtension(ext: string): string {
  const e = ext.toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
  };
  return map[e] ?? "application/octet-stream";
}
