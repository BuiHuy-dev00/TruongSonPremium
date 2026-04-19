import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { createCategory } from "@/server/services/category.service";
import { categoryCreateSchema } from "@/server/validation/category";

export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const items = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return ok({ items });
}

export async function POST(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const created = await createCategory({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      sortOrder: parsed.data.sortOrder,
      isVisible: parsed.data.isVisible,
    });
    return ok(created, { status: 201, message: "Tạo danh mục thành công" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}
