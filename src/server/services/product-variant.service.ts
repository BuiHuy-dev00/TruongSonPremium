import type { ProductVariant } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Cập nhật `Product.price` (min) và `priceUnit` (gói đơn / rỗng khi đa biến thể). */
export async function syncProductDerivedPrice(productId: string): Promise<void> {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
  const prices = variants.map((v) => v.price);
  const min = prices.length ? Math.min(...prices) : 0;
  await prisma.product.update({
    where: { id: productId },
    data: {
      price: min,
      priceUnit:
        variants.length === 1 && variants[0]
          ? variants[0].label
          : "",
    },
  });
}

export type VariantInput = {
  label: string;
  duration?: number | null;
  durationUnit?: string | null;
  price: number;
  originalPrice?: number | null;
  note?: string | null;
  sortOrder?: number;
};

export async function createVariant(
  productId: string,
  input: VariantInput
): Promise<ProductVariant> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error("Không tìm thấy sản phẩm"), {
      code: "NOT_FOUND",
    });
  }

  const maxOrder = await prisma.productVariant.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const nextOrder =
    input.sortOrder ??
    (maxOrder._max.sortOrder ?? -1) + 1;

  const row = await prisma.productVariant.create({
    data: {
      productId,
      label: input.label.trim(),
      duration: input.duration ?? null,
      durationUnit: input.durationUnit?.trim() || null,
      price: input.price,
      originalPrice: input.originalPrice ?? null,
      note: input.note?.trim() || null,
      sortOrder: nextOrder,
    },
  });

  await syncProductDerivedPrice(productId);
  return row;
}

export async function updateVariant(
  productId: string,
  variantId: string,
  input: Partial<VariantInput>
): Promise<ProductVariant> {
  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!v) {
    throw Object.assign(new Error("Không tìm thấy biến thể"), {
      code: "NOT_FOUND",
    });
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(input.label !== undefined ? { label: input.label.trim() } : {}),
      ...(input.duration !== undefined ? { duration: input.duration } : {}),
      ...(input.durationUnit !== undefined
        ? { durationUnit: input.durationUnit?.trim() || null }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.originalPrice !== undefined
        ? { originalPrice: input.originalPrice }
        : {}),
      ...(input.note !== undefined
        ? { note: input.note?.trim() || null }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  await syncProductDerivedPrice(productId);
  return updated;
}

export async function deleteVariant(
  productId: string,
  variantId: string
): Promise<void> {
  const count = await prisma.productVariant.count({ where: { productId } });
  if (count <= 1) {
    throw Object.assign(
      new Error("Không thể xóa biến thể cuối cùng của sản phẩm"),
      { code: "LAST_VARIANT" }
    );
  }

  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!v) {
    throw Object.assign(new Error("Không tìm thấy biến thể"), {
      code: "NOT_FOUND",
    });
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
  await syncProductDerivedPrice(productId);
}
