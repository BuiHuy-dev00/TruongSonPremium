import { fromZodError, fail, ok } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/require-admin";
import { reorderProducts } from "@/server/services/product.service";
import { productReorderSchema } from "@/server/validation/product";

export async function PATCH(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = productReorderSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  await reorderProducts(parsed.data.orderedIds);
  return ok({ reordered: true }, { message: "Cập nhật thứ tự thành công" });
}
