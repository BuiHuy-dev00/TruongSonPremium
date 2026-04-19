import { revalidatePath } from "next/cache";
import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import {
  deleteVariant,
  updateVariant,
} from "@/server/services/product-variant.service";
import { productVariantUpdateSchema } from "@/server/validation/product";

type RouteContext = {
  params: Promise<{ id: string; variantId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id: productId, variantId } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = productVariantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const updated = await updateVariant(productId, variantId, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok(updated, { message: "Đã cập nhật biến thể" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id: productId, variantId } = await context.params;
  try {
    await deleteVariant(productId, variantId);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok({ deleted: true }, { message: "Đã xóa biến thể" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}
