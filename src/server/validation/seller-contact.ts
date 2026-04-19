import { z } from "zod";

/** Cho phép mọi chuỗi (hiển thị đúng như admin nhập), không bắt URL hợp lệ. */
const optionalLooseText = z
  .union([z.string().max(20000), z.literal(""), z.null()])
  .optional();

export const sellerContactUpdateSchema = z.object({
  telegramUrl: optionalLooseText,
  telegramHandle: optionalLooseText,
  zaloDisplay: optionalLooseText,
  zaloUrl: optionalLooseText,
  facebookUrl: optionalLooseText,
  facebookLabel: optionalLooseText,
  phone: optionalLooseText,
  note: optionalLooseText,
});
