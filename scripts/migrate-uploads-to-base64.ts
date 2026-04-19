/**
 * Một lần: đọc file ảnh cũ (imageUrl dạng /uploads/...) và cập nhật DB thành data URL base64.
 * Chạy từ thư mục gốc project: pnpm exec tsx scripts/migrate-uploads-to-base64.ts
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mimeFromExtension(ext: string): string {
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

async function main() {
  const rows = await prisma.product.findMany({
    where: { imageUrl: { startsWith: "/uploads/" } },
  });
  if (rows.length === 0) {
    console.log("Không có sản phẩm nào dùng ảnh /uploads/ — không cần migrate.");
    return;
  }
  console.log(`Tìm thấy ${rows.length} sản phẩm, đang đọc file và chuyển base64...`);
  for (const p of rows) {
    const rel = p.imageUrl.replace(/^\//, "");
    const diskPath = join(process.cwd(), "public", rel);
    try {
      const buf = await readFile(diskPath);
      const extMatch = p.imageUrl.match(/\.[^./?#]+$/);
      const ext = extMatch?.[0] ?? ".jpg";
      const mime = mimeFromExtension(ext);
      if (mime === "application/octet-stream") {
        console.warn("SKIP", p.id, "unknown ext", ext);
        continue;
      }
      const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: dataUrl },
      });
      console.log("OK", p.id, p.name.slice(0, 48));
    } catch (e) {
      console.error("FAIL", p.id, p.imageUrl, e);
    }
  }
  console.log("Xong.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
