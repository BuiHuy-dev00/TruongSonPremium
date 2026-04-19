import { fromZodError, fail, ok } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/require-admin";
import { reorderCategories } from "@/server/services/category.service";
import { categoryReorderSchema } from "@/server/validation/category";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = categoryReorderSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  const all = await prisma.category.findMany({ select: { id: true } });
  if (parsed.data.orderedIds.length !== all.length) {
    return fail("orderedIds phải bao gồm đủ tất cả danh mục", 400);
  }
  const set = new Set(all.map((c) => c.id));
  for (const id of parsed.data.orderedIds) {
    if (!set.has(id)) {
      return fail("Có id danh mục không tồn tại", 400);
    }
  }

  await reorderCategories(parsed.data.orderedIds);
  return ok({ reordered: true }, { message: "Cập nhật thứ tự thành công" });
}
