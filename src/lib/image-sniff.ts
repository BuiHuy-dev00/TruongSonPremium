/**
 * Khi trình duyệt/OS gửi `application/octet-stream` hoặc để trống MIME,
 * đoán đuôi file từ magic bytes (tránh lưu sai đuôi → ảnh vỡ).
 */
export function sniffImageExtension(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  const b0 = buf[0];
  const b1 = buf[1];
  const b2 = buf[2];
  const b3 = buf[3];

  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) return ".jpg";
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) return ".png";
  if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) return ".gif";

  const riff = buf.subarray(0, 4).toString("ascii");
  const webpTag = buf.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webpTag === "WEBP") return ".webp";

  const head32 = buf.subarray(0, Math.min(buf.length, 64)).toString("binary");
  if (head32.includes("ftyp") && (head32.includes("avif") || head32.includes("avis"))) {
    return ".avif";
  }

  if (b0 === 0x42 && b1 === 0x4d) return ".bmp";

  const textProbe = buf
    .subarray(0, Math.min(buf.length, 512))
    .toString("utf8")
    .trimStart();
  if (textProbe.startsWith("<svg") || textProbe.startsWith("<?xml")) {
    return ".svg";
  }

  return null;
}
