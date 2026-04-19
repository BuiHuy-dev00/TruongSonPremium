import { ok, fail } from "@/lib/api-response";
import { mimeFromExtension } from "@/lib/image-mime";
import { sniffImageExtension } from "@/lib/image-sniff";
import { requireAdminSession } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXT = new Map([
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/pjpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/x-png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
  ["image/bmp", ".bmp"],
  ["image/x-ms-bmp", ".bmp"],
  ["image/svg+xml", ".svg"],
]);

/** Lưu ảnh dưới dạng data URL base64 trong DB — không ghi file đĩa. */
export async function POST(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("Không đọc được form upload", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || typeof (file as File).arrayBuffer !== "function") {
    return fail("Thiếu file ảnh", 400);
  }

  const typed = file as File;
  if (typed.size > MAX_BYTES) {
    return fail("Ảnh tối đa 5MB", 400);
  }

  const buf = Buffer.from(await typed.arrayBuffer());
  if (buf.length === 0) {
    return fail("File rỗng", 400);
  }

  const mimeNorm = typed.type?.toLowerCase().split(";")[0]?.trim() ?? "";
  let ext =
    sniffImageExtension(buf) ?? MIME_EXT.get(mimeNorm) ?? undefined;
  if (!ext) {
    return fail(
      "Không nhận dạng được ảnh (MIME trống hoặc định dạng chưa hỗ trợ). Hãy dùng JPG, PNG, WebP, GIF, AVIF, BMP, SVG — hoặc dán URL ảnh https.",
      400
    );
  }

  const mime = mimeFromExtension(ext);
  if (mime === "application/octet-stream") {
    return fail("Không xác định được loại ảnh để mã hóa base64.", 400);
  }

  const base64 = buf.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  return ok({ url: dataUrl }, { message: "Đã chuyển ảnh sang base64" });
}
