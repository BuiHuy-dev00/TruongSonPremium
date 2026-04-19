import type { Category, Product } from "@prisma/client";
import { formatVnd } from "@/lib/format";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string;
  detailDescription: string | null;
  price: number;
  priceFormatted: string;
  priceUnit: string;
  imageUrl: string;
  isHot: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export function toPublicProduct(
  p: Product & { category: Category }
): PublicProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? null,
    shortDescription: p.shortDescription,
    detailDescription: p.detailDescription ?? null,
    price: p.price,
    priceFormatted: formatVnd(p.price),
    priceUnit: p.priceUnit,
    imageUrl: p.imageUrl,
    isHot: p.isHot,
    isFeatured: p.isFeatured,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    },
  };
}
