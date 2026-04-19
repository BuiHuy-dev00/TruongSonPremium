import type { Category, Prisma, Product, ProductVariant } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugFromName, uniqueSlug } from "@/server/services/slug-unique";
import { slugify } from "@/lib/slug";
import type { PaginationQuery } from "@/server/validation/pagination";
import type { ProductListQuery } from "@/server/validation/product";
import type { PublicProductListQuery } from "@/server/validation/public";
import { syncProductDerivedPrice } from "@/server/services/product-variant.service";

export type ProductWithCategory = Product & {
  category: Category;
  variants: ProductVariant[];
};

const variantInclude = {
  orderBy: { sortOrder: "asc" } as const,
};

const productInclude = {
  category: true,
  variants: variantInclude,
} as const;

export type CreateProductInput = {
  name: string;
  slug?: string | null;
  sku?: string | null;
  shortDescription: string;
  detailDescription?: string | null;
  imageUrl: string;
  categoryId: string;
  isHot?: boolean;
  isFeatured?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  variants?: Array<{
    label: string;
    duration?: number | null;
    durationUnit?: string | null;
    price: number;
    originalPrice?: number | null;
    note?: string | null;
    sortOrder?: number;
  }>;
  /** Tương thích: tạo đúng 1 biến thể khi chưa gửi mảng `variants` */
  price?: number;
  priceUnit?: string;
};

function normalizeCreateVariants(
  input: CreateProductInput
): Array<{
  label: string;
  duration: number | null;
  durationUnit: string | null;
  price: number;
  originalPrice: number | null;
  note: string | null;
  sortOrder: number;
}> {
  if (input.variants?.length) {
    return input.variants.map((v, i) => ({
      label: v.label.trim(),
      duration: v.duration ?? null,
      durationUnit: v.durationUnit?.trim() || null,
      price: v.price,
      originalPrice: v.originalPrice ?? null,
      note: v.note?.trim() || null,
      sortOrder: v.sortOrder ?? i,
    }));
  }
  if (input.price !== undefined && input.priceUnit !== undefined) {
    return [
      {
        label: input.priceUnit.trim() || "Mặc định",
        duration: null,
        durationUnit: null,
        price: input.price,
        originalPrice: null,
        note: null,
        sortOrder: 0,
      },
    ];
  }
  throw Object.assign(
    new Error("Cần ít nhất một biến thể (gói) hoặc cặp giá + đơn vị"),
    { code: "BAD_INPUT" }
  );
}

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

export async function createProduct(
  input: CreateProductInput
): Promise<ProductWithCategory> {
  await assertProductNameUnique(input.name);

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), {
      code: "BAD_CATEGORY",
    });
  }

  const rows = normalizeCreateVariants(input);
  const minPrice = Math.min(...rows.map((r) => r.price));

  const slug = input.slug?.trim()
    ? await uniqueSlug("product", slugify(input.slug.trim()))
    : await slugFromName("product", input.name);

  const created = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug,
      sku: input.sku?.trim() || null,
      shortDescription: input.shortDescription.trim(),
      detailDescription: input.detailDescription?.trim() || null,
      price: minPrice,
      priceUnit: rows.length === 1 ? rows[0].label : "",
      imageUrl: input.imageUrl.trim(),
      categoryId: input.categoryId,
      isHot: input.isHot ?? false,
      isFeatured: input.isFeatured ?? false,
      isVisible: input.isVisible ?? true,
      sortOrder: input.sortOrder ?? 0,
      variants: {
        create: rows.map((r) => ({
          label: r.label,
          duration: r.duration,
          durationUnit: r.durationUnit,
          price: r.price,
          originalPrice: r.originalPrice,
          note: r.note,
          sortOrder: r.sortOrder,
        })),
      },
    },
    include: productInclude,
  });

  await syncProductDerivedPrice(created.id);
  return prisma.product.findUniqueOrThrow({
    where: { id: created.id },
    include: productInclude,
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
    include: productInclude,
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

  await prisma.product.update({
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
  });

  await syncProductDerivedPrice(id);

  return prisma.product.findUniqueOrThrow({
    where: { id },
    include: productInclude,
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
      include: productInclude,
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
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export async function listHotProducts(
  limit: number
): Promise<ProductWithCategory[]> {
  return prisma.product.findMany({
    where: {
      isVisible: true,
      isHot: true,
      category: { isVisible: true },
    },
    include: productInclude,
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
    include: productInclude,
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
    include: productInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}
