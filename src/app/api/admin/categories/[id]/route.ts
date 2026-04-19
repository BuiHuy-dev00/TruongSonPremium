import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import {
  deleteCategory,
  updateCategory,
} from "@/server/services/category.service";
import { categoryUpdateSchema } from "@/server/validation/category";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return fail("Không tìm thấy danh mục", 404);
  }
  return ok(category);
}

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const updated = await updateCategory(id, parsed.data);
    return ok(updated, { message: "Cập nhật danh mục thành công" });
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
    await deleteCategory(id);
    return ok({ deleted: true }, { message: "Đã xóa danh mục" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}
