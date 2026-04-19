import type { Category } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { slugFromName, uniqueSlug } from "@/server/services/slug-unique";

export async function assertCategoryNameUnique(
  name: string,
  excludeId?: string
): Promise<void> {
  const existing = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw Object.assign(new Error("Tên danh mục đã tồn tại"), {
      code: "NAME_CONFLICT",
    });
  }
}

export async function createCategory(input: {
  name: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
}): Promise<Category> {
  await assertCategoryNameUnique(input.name);

  const slug = input.slug?.trim()
    ? await uniqueSlug("category", slugify(input.slug.trim()))
    : await slugFromName("category", input.name);

  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      isVisible: input.isVisible ?? true,
    },
  });
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    slug: string | null;
    description: string | null;
    sortOrder: number;
    isVisible: boolean;
  }>
): Promise<Category> {
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) {
    throw Object.assign(new Error("Không tìm thấy danh mục"), {
      code: "NOT_FOUND",
    });
  }

  if (input.name !== undefined) {
    await assertCategoryNameUnique(input.name.trim(), id);
  }

  let slug = current.slug;
  if (input.slug !== undefined && input.slug !== null) {
    const base = slugify(input.slug.trim());
    slug = await uniqueSlug("category", base, id);
  } else if (input.name !== undefined && !input.slug) {
    slug = await slugFromName("category", input.name.trim(), id);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      slug,
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
    },
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw Object.assign(
      new Error("Không thể xóa danh mục còn sản phẩm. Hãy xóa hoặc chuyển sản phẩm trước."),
      { code: "HAS_PRODUCTS" }
    );
  }
  await prisma.category.delete({ where: { id } });
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}
