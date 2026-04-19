import { prisma } from "@/lib/db";

export type DashboardStats = {
  totalCategories: number;
  totalProducts: number;
  totalHotProducts: number;
  totalVisibleProducts: number;
  productsPerCategory: {
    categoryId: string;
    name: string;
    slug: string;
    count: number;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalCategories,
    totalProducts,
    totalHotProducts,
    totalVisibleProducts,
    grouped,
  ] = await prisma.$transaction([
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { isHot: true } }),
    prisma.product.count({ where: { isVisible: true } }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return {
    totalCategories,
    totalProducts,
    totalHotProducts,
    totalVisibleProducts,
    productsPerCategory: grouped.map((c) => ({
      categoryId: c.id,
      name: c.name,
      slug: c.slug,
      count: c._count.products,
    })),
  };
}
