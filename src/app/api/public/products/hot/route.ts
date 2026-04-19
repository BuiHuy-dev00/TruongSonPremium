import { listHotProducts } from "@/server/services/product.service";
import { toPublicProduct } from "@/server/mappers/product-public";
import { ok } from "@/lib/api-response";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );
  const limit = parsed.success ? parsed.data.limit : 12;
  const products = await listHotProducts(limit);
  return ok({ items: products.map(toPublicProduct) });
}
