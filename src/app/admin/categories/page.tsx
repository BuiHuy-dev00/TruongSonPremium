import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesAdminClient } from "@/components/admin/categories-admin-client";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <AdminShell
      title="Danh mục"
      subtitle="Quản lý danh mục hiển thị trên storefront."
      userLabel={session.user.email}
    >
      <CategoriesAdminClient categories={categories} />
    </AdminShell>
  );
}
