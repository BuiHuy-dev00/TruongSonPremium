import { fail, ok } from "@/lib/api-response";
import { getPublicProductBySlug } from "@/server/services/product.service";
import { toPublicProduct } from "@/server/mappers/product-public";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const decoded = decodeURIComponent(slug);
  const product = await getPublicProductBySlug(decoded);
  if (!product) {
    return fail("Không tìm thấy sản phẩm", 404);
  }
  return ok(toPublicProduct(product));
}
