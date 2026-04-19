import { z } from "zod";

const boolFromQuery = z.preprocess(
  (v) => {
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return undefined;
  },
  z.boolean().optional()
);

export const publicProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  categorySlug: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  isHot: boolFromQuery,
});

export type PublicProductListQuery = z.infer<
  typeof publicProductListQuerySchema
>;
