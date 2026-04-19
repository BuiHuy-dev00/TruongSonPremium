import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminIcon } from "@/components/admin/admin-icon";
import Link from "next/link";
import { ProductImage } from "@/components/shop/product-image";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    take: 25,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { category: true },
  });

  return (
    <AdminShell
      title="Bảng điều khiển"
      subtitle="Chào mừng quay trở lại hệ thống quản trị."
      userLabel={session.user.email}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Thao tác nhanh: thêm danh mục, sản phẩm hoặc cập nhật toàn bộ ở trang
            tương ứng.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-muted"
            >
              <AdminIcon name="category" size={18} />
              Danh mục
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/20 transition hover:bg-primary/15"
            >
              <AdminIcon name="inventory_2" size={18} />
              Sản phẩm
            </Link>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Sản phẩm gần đây
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách xem nhanh — chỉnh sửa chi tiết tại mục Sản phẩm.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted/60 text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">Ảnh</th>
                    <th className="px-6 py-4 font-semibold">Tên</th>
                    <th className="px-6 py-4 font-semibold">Giá</th>
                    <th className="px-6 py-4 font-semibold">Danh mục</th>
                    <th className="px-6 py-4 font-semibold">Hot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        Chưa có sản phẩm.{" "}
                        <Link
                          href="/admin/products"
                          className="font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          Thêm sản phẩm
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr
                        key={p.id}
                        className="group transition-colors hover:bg-muted/50"
                      >
                        <td className="px-6 py-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            <ProductImage
                              variant="fill"
                              src={p.imageUrl}
                              alt={p.name}
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground">{p.name}</p>
                          {p.sku ? (
                            <p className="text-xs text-muted-foreground">
                              SKU: {p.sku}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">
                          {formatVnd(p.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                            {p.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.isHot ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-accent">
                              <AdminIcon
                                name="local_fire_department"
                                size={16}
                              />
                              Hot
                            </span>
                          ) : (
                            <span className="text-xs italic text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
