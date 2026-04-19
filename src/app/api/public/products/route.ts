import { fromZodError, fail, ok } from "@/lib/api-response";
import { listPublicProducts } from "@/server/services/product.service";
import { toPublicProduct } from "@/server/mappers/product-public";
import { publicProductListQuerySchema } from "@/server/validation/public";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = publicProductListQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    const body = fromZodError(parsed.error);
    return fail(body.message, 400, body.errors);
  }

  const productQuery = parsed.data;
  const pagination = {
    page: productQuery.page,
    limit: productQuery.limit,
  };

  const { items, total } = await listPublicProducts(productQuery, pagination);
  const totalPages = Math.ceil(total / pagination.limit) || 1;

  return ok(
    { items: items.map(toPublicProduct) },
    {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    }
  );
}
