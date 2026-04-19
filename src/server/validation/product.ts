import { z } from "zod";

/** ~7MB base64 tương đương ~5MB file nhị phân (giới hạn an toàn cho JSON/Postgres TEXT). */
const MAX_IMAGE_URL_LEN = 10_000_000;

function isDataImageUrl(v: string): boolean {
  if (!v.startsWith("data:image/")) return false;
  const idx = v.indexOf(";base64,");
  if (idx === -1) return false;
  const payload = v.slice(idx + ";base64,".length).replace(/\s/g, "");
  return payload.length >= 8;
}

export const imageUrlFlexible = z
  .string()
  .trim()
  .min(1)
  .max(MAX_IMAGE_URL_LEN)
  .refine(
    (v) => {
      if (v.includes("..")) return false;
      if (isDataImageUrl(v)) return true;
      if (v.startsWith("/uploads/")) return true;
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message:
        "URL ảnh không hợp lệ (data:image/...;base64,... hoặc https hoặc /uploads/...)",
    }
  );

const durationUnitEnum = z.enum(["month", "year", "forever", "once"]);

export const productVariantInputSchema = z.object({
  label: z.string().min(1).max(200),
  duration: z.number().int().positive().optional().nullable(),
  durationUnit: durationUnitEnum.optional().nullable(),
  price: z.number().int().min(0).max(2_000_000_000),
  originalPrice: z.number().int().min(0).max(2_000_000_000).optional().nullable(),
  note: z.string().max(5000).optional().nullable(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
});

export const productCreateSchema = z
  .object({
    name: z.string().min(1).max(200),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Slug chỉ gồm chữ, số và dấu gạch ngang")
      .optional(),
    sku: z.string().max(80).optional().nullable(),
    shortDescription: z.string().min(1).max(500),
    detailDescription: z.string().max(20000).optional().nullable(),
    imageUrl: imageUrlFlexible,
    categoryId: z.string().min(1),
    isHot: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(1_000_000).optional(),
    variants: z.array(productVariantInputSchema).min(1).optional(),
    price: z.number().int().min(0).max(2_000_000_000).optional(),
    priceUnit: z.string().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.variants?.length) return;
    if (
      data.price !== undefined &&
      data.priceUnit !== undefined &&
      data.priceUnit.trim().length > 0
    ) {
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Cần ít nhất một biến thể trong mảng variants, hoặc cặp price + priceUnit (kiểu cũ)",
      path: ["variants"],
    });
  });

export const productUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
      .optional()
      .nullable(),
    sku: z.string().max(80).optional().nullable(),
    shortDescription: z.string().min(1).max(500).optional(),
    detailDescription: z.string().max(20000).optional().nullable(),
    imageUrl: imageUrlFlexible.optional(),
    categoryId: z.string().min(1).optional(),
    isHot: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần ít nhất một trường để cập nhật",
  });

export const productVariantCreateSchema = productVariantInputSchema;

export const productVariantUpdateSchema = productVariantInputSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Cần ít nhất một trường" }
);

const boolFromQuery = z.preprocess(
  (v) => {
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return undefined;
  },
  z.boolean().optional()
);

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  q: z.string().max(200).optional(),
  isHot: boolFromQuery,
  isVisible: boolFromQuery,
});

export const productReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
