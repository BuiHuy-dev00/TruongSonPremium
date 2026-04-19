import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsAdminClient } from "@/components/admin/products-admin-client";

/** Luôn đọc DB mới sau khi lưu ảnh/sản phẩm (tránh cache RSC cũ). */
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  const [products, categoryOptions] = await Promise.all([
    prisma.product.findMany({
      take: 100,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <AdminShell
      title="Sản phẩm"
      subtitle="Danh sách dịch vụ / sản phẩm báo giá."
      userLabel={session.user.email}
    >
      <ProductsAdminClient
        products={products}
        categoryOptions={categoryOptions}
      />
    </AdminShell>
  );
}
