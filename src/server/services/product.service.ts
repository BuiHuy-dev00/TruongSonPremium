import type { Category, Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugFromName, uniqueSlug } from "@/server/services/slug-unique";
import { slugify } from "@/lib/slug";
import type { PaginationQuery } from "@/server/validation/pagination";
import type { ProductListQuery } from "@/server/validation/product";
import type { PublicProductListQuery } from "@/server/validation/public";

export type ProductWithCategory = Product & { category: Category };

export async function assertProductNameUnique(
  name: string,
  excludeId?: string
): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw Object.assign(new Error("Tên sản phẩm đã tồn tại"), {
      code: "NAME_CONFLICT",
    });
  }
}

export async function createProduct(input: {
  name: string;
  slug?: string | null;
  sku?: string | null;
  shortDescription: string;
  detailDescription?: string | null;
  price: number;
  priceUnit: string;
  imageUrl: string;
  categoryId: string;
  isHot?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
}): Promise<ProductWithCategory> {
  await assertProductNameUnique(input.name);

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), {
      code: "BAD_CATEGORY",
    });
  }

  const slug = input.slug?.trim()
    ? await uniqueSlug("product", slugify(input.slug.trim()))
    : await slugFromName("product", input.name);

  return prisma.product.create({
    data: {
      name: input.name.trim(),
      slug,
      sku: input.sku?.trim() || null,
      shortDescription: input.shortDescription.trim(),
      detailDescription: input.detailDescription?.trim() || null,
      price: input.price,
      priceUnit: input.priceUnit.trim(),
      imageUrl: input.imageUrl.trim(),
      categoryId: input.categoryId,
      isHot: input.isHot ?? false,
      isFeatured: input.isFeatured ?? false,
      isVisible: input.isVisible ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
    include: { category: true },
  });
}

export async function updateProduct(
  id: string,
  input: Partial<{
    name: string;
    slug: string | null;
    sku: string | null;
    shortDescription: string;
    detailDescription: string | null;
    price: number;
    priceUnit: string;
    imageUrl: string;
    categoryId: string;
    isHot: boolean;
    isFeatured: boolean;
    isVisible: boolean;
    sortOrder: number;
  }>
): Promise<ProductWithCategory> {
  const current = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!current) {
    throw Object.assign(new Error("Không tìm thấy sản phẩm"), {
      code: "NOT_FOUND",
    });
  }

  if (input.name !== undefined) {
    await assertProductNameUnique(input.name.trim(), id);
  }

  if (input.categoryId !== undefined) {
    const cat = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!cat) {
      throw Object.assign(new Error("Danh mục không tồn tại"), {
        code: "BAD_CATEGORY",
      });
    }
  }

  let slug = current.slug;
  if (input.slug !== undefined && input.slug !== null) {
    const base = slugify(input.slug.trim());
    slug = await uniqueSlug("product", base, id);
  } else if (input.name !== undefined && input.slug === undefined) {
    slug = await slugFromName("product", input.name.trim(), id);
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      slug,
      ...(input.sku !== undefined ? { sku: input.sku?.trim() || null } : {}),
      ...(input.shortDescription !== undefined
        ? { shortDescription: input.shortDescription.trim() }
        : {}),
      ...(input.detailDescription !== undefined
        ? { detailDescription: input.detailDescription?.trim() || null }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.priceUnit !== undefined
        ? { priceUnit: input.priceUnit.trim() }
        : {}),
      ...(input.imageUrl !== undefined
        ? { imageUrl: input.imageUrl.trim() }
        : {}),
      ...(input.categoryId !== undefined
        ? { categoryId: input.categoryId }
        : {}),
      ...(input.isHot !== undefined ? { isHot: input.isHot } : {}),
      ...(input.isFeatured !== undefined
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
    include: { category: true },
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((productId, index) =>
      prisma.product.update({
        where: { id: productId },
        data: { sortOrder: index },
      })
    )
  );
}

export function buildAdminProductWhere(
  query: ProductListQuery
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.q?.trim()) {
    where.name = { contains: query.q.trim(), mode: "insensitive" };
  }
  if (query.isHot !== undefined) {
    where.isHot = query.isHot;
  }
  if (query.isVisible !== undefined) {
    where.isVisible = query.isVisible;
  }
  return where;
}

export async function listProductsAdmin(
  query: ProductListQuery,
  pagination: PaginationQuery
): Promise<{ items: ProductWithCategory[]; total: number }> {
  const where = buildAdminProductWhere(query);
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export function buildPublicProductWhere(
  query: PublicProductListQuery
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isVisible: true,
    category: { isVisible: true },
  };

  if (query.categorySlug?.trim()) {
    where.category = {
      is: {
        slug: query.categorySlug.trim(),
        isVisible: true,
      },
    };
  }

  if (query.q?.trim()) {
    where.name = { contains: query.q.trim(), mode: "insensitive" };
  }

  if (query.isHot !== undefined) {
    where.isHot = query.isHot;
  }

  return where;
}

export async function listPublicProducts(
  query: PublicProductListQuery,
  pagination: PaginationQuery
): Promise<{ items: ProductWithCategory[]; total: number }> {
  const where = buildPublicProductWhere(query);
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export async function listHotProducts(limit: number): Promise<ProductWithCategory[]> {
  return prisma.product.findMany({
    where: {
      isVisible: true,
      isHot: true,
      category: { isVisible: true },
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getPublicProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  return prisma.product.findFirst({
    where: {
      slug,
      isVisible: true,
      category: { isVisible: true },
    },
    include: { category: true },
  });
}

export async function listProductsByCategorySlug(
  categorySlug: string,
  limit: number
): Promise<ProductWithCategory[]> {
  return prisma.product.findMany({
    where: {
      isVisible: true,
      category: {
        slug: categorySlug,
        isVisible: true,
      },
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}
