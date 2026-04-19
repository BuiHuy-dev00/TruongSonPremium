import { revalidatePath } from "next/cache";
import { fromZodError, fail, ok } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/require-admin";
import {
  getSellerContact,
  updateSellerContact,
} from "@/server/services/seller-contact.service";
import { sellerContactUpdateSchema } from "@/server/validation/seller-contact";

/** Chuỗi rỗng / khoảng trắng → null để Prisma lưu đúng; giữ text admin nhập. */
function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const contact = await getSellerContact();
  return ok(contact);
}

export async function PATCH(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = sellerContactUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  const d = parsed.data;

  await updateSellerContact({
    ...(d.telegramUrl !== undefined && {
      telegramUrl: toNullableString(d.telegramUrl),
    }),
    ...(d.telegramHandle !== undefined && {
      telegramHandle: toNullableString(d.telegramHandle),
    }),
    ...(d.zaloDisplay !== undefined && {
      zaloDisplay: toNullableString(d.zaloDisplay),
    }),
    ...(d.zaloUrl !== undefined && { zaloUrl: toNullableString(d.zaloUrl) }),
    ...(d.facebookUrl !== undefined && {
      facebookUrl: toNullableString(d.facebookUrl),
    }),
    ...(d.facebookLabel !== undefined && {
      facebookLabel: toNullableString(d.facebookLabel),
    }),
    ...(d.phone !== undefined && { phone: toNullableString(d.phone) }),
    ...(d.note !== undefined && { note: toNullableString(d.note) }),
  });

  revalidatePath("/");

  const updated = await getSellerContact();
  return ok(updated, { message: "Cập nhật thông tin liên hệ thành công" });
}
