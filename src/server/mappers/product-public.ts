import type { Category, Product, ProductVariant } from "@prisma/client";
import {
  formatPriceVN,
  formatProductPriceRange,
  getProductPriceRange,
} from "@/lib/product-price";
import type { PublicProduct, PublicVariant } from "@/types/product-public";

export type { PublicProduct, PublicVariant } from "@/types/product-public";

function toPublicVariant(v: ProductVariant): PublicVariant {
  return {
    id: v.id,
    label: v.label,
    duration: v.duration,
    durationUnit: v.durationUnit,
    price: v.price,
    priceFormatted: formatPriceVN(v.price),
    originalPrice: v.originalPrice,
    originalPriceFormatted:
      v.originalPrice != null ? formatPriceVN(v.originalPrice) : null,
    note: v.note,
    sortOrder: v.sortOrder,
  };
}

export function toPublicProduct(
  p: Product & { category: Category; variants?: ProductVariant[] }
): PublicProduct {
  const variants = (p.variants ?? []).map(toPublicVariant);
  const prices =
    variants.length > 0
      ? variants.map((x) => x.price)
      : [p.price];
  const { min, max } = getProductPriceRange(prices);
  const hasMultiplePrices = variants.length > 1 && min !== max;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? null,
    shortDescription: p.shortDescription,
    detailDescription: p.detailDescription ?? null,
    price: min,
    priceFormatted: formatPriceVN(min),
    priceUnit: variants.length === 1 ? variants[0].label : p.priceUnit,
    priceRangeLabel: formatProductPriceRange(min, max),
    hasMultiplePrices,
    imageUrl: p.imageUrl,
    isHot: p.isHot,
    isFeatured: p.isFeatured,
    variants,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    },
  };
}
