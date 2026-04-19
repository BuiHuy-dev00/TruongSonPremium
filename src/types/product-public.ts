/** Kiểu API công khai / client cho sản phẩm + biến thể (tránh import server-only vào client). */
export type PublicVariant = {
  id: string;
  label: string;
  duration: number | null;
  durationUnit: string | null;
  price: number;
  priceFormatted: string;
  originalPrice: number | null;
  originalPriceFormatted: string | null;
  note: string | null;
  sortOrder: number;
};

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
  priceRangeLabel: string;
  hasMultiplePrices: boolean;
  imageUrl: string;
  isHot: boolean;
  isFeatured: boolean;
  variants: PublicVariant[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
};
