import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Slug chỉ gồm chữ, số và dấu gạch ngang")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  isVisible: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Cần ít nhất một trường để cập nhật" }
);

export const categoryReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
