import { revalidatePath } from "next/cache";
import { fromZodError, fail, ok } from "@/lib/api-response";
import { mapServiceError } from "@/lib/map-service-error";
import { requireAdminSession } from "@/lib/require-admin";
import {
  createProduct,
  listProductsAdmin,
} from "@/server/services/product.service";
import {
  productCreateSchema,
  productListQuerySchema,
} from "@/server/validation/product";

export async function GET(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const parsed = productListQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  const q = parsed.data;
  const pagination = { page: q.page, limit: q.limit };
  const { items, total } = await listProductsAdmin(q, pagination);
  const totalPages = Math.ceil(total / pagination.limit) || 1;

  return ok(
    { items },
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

export async function POST(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    const e = fromZodError(parsed.error);
    return fail(e.message, 400, e.errors);
  }

  try {
    const created = await createProduct(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return ok(created, { status: 201, message: "Tạo sản phẩm thành công" });
  } catch (err) {
    const mapped = mapServiceError(err);
    if (mapped) return mapped;
    throw err;
  }
}
