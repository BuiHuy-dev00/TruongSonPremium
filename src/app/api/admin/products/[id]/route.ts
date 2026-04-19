import { revalidatePath } from "next/cache";
import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import {
  deleteProduct,
  updateProduct,
} from "@/server/services/product.service";
import { productUpdateSchema } from "@/server/validation/product";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    return fail("Không tìm thấy sản phẩm", 404);
  }
  return ok(product);
}

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const updated = await updateProduct(id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok(updated, { message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  try {
    await deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok({ deleted: true }, { message: "Đã xóa sản phẩm" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2025"
    ) {
      return fail("Không tìm thấy sản phẩm", 404);
    }
    throw err;
  }
}
