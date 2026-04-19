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
          <p className="text-sm text-slate-400">
            Thao tác nhanh: thêm danh mục, sản phẩm hoặc cập nhật toàn bộ ở trang
            tương ứng.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#95aaff]/40 hover:text-white"
            >
              <AdminIcon name="category" size={18} />
              Danh mục
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-[#95aaff]/20 to-[#00e3fd]/20 px-4 py-2 text-sm font-bold text-white ring-1 ring-[#95aaff]/30 transition hover:ring-[#00e3fd]/40"
            >
              <AdminIcon name="inventory_2" size={18} />
              Sản phẩm
            </Link>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white">Sản phẩm gần đây</h3>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách xem nhanh — chỉnh sửa chi tiết tại mục Sản phẩm.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 font-semibold">Ảnh</th>
                    <th className="px-6 py-4 font-semibold">Tên</th>
                    <th className="px-6 py-4 font-semibold">Giá</th>
                    <th className="px-6 py-4 font-semibold">Danh mục</th>
                    <th className="px-6 py-4 font-semibold">Hot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        Chưa có sản phẩm.{" "}
                        <Link
                          href="/admin/products"
                          className="font-semibold text-[#95aaff] underline-offset-4 hover:underline"
                        >
                          Thêm sản phẩm
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr
                        key={p.id}
                        className="group transition-colors hover:bg-white/[0.02]"
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
                          <p className="font-bold text-white">{p.name}</p>
                          {p.sku ? (
                            <p className="text-xs text-slate-500">
                              SKU: {p.sku}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#95aaff]">
                          {formatVnd(p.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            {p.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.isHot ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-[#00e3fd]">
                              <AdminIcon
                                name="local_fire_department"
                                size={16}
                              />
                              Hot
                            </span>
                          ) : (
                            <span className="text-xs italic text-slate-600">
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
