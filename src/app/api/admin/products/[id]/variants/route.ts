import { revalidatePath } from "next/cache";
import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import { createVariant } from "@/server/services/product-variant.service";
import { productVariantCreateSchema } from "@/server/validation/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id: productId } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = productVariantCreateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const created = await createVariant(productId, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok(created, { status: 201, message: "Đã thêm biến thể" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}
