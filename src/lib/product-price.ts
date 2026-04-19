import { formatVnd } from "@/lib/format";

/** Alias rõ ràng cho format tiền VN (public + admin). */
export function formatPriceVN(amount: number): string {
  return formatVnd(amount);
}

/** Hiển thị giá dạng "400.000 VNĐ" (modal shop / gói). */
export function formatPricePlainVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function getProductPriceRange(prices: number[]): {
  min: number;
  max: number;
} {
  if (prices.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/** Một mức giá hoặc khoảng min–max (chữ VNĐ). */
export function formatProductPriceRange(min: number, max: number): string {
  if (min === max) return formatVnd(min);
  return `${formatVnd(min)} – ${formatVnd(max)}`;
}

/** Chuỗi hiển thị thời hạn / đơn vị cho biến thể (client + server). */
export function formatVariantDurationLabel(input: {
  duration: number | null;
  durationUnit: string | null;
}): string | null {
  const unit = input.durationUnit?.trim();
  if (!unit) return null;
  if (unit === "forever") return "Vĩnh viễn";
  if (unit === "once") return "Một lần";
  const n = input.duration;
  if (n == null || Number.isNaN(n)) return null;
  if (unit === "month") return `${n} tháng`;
  if (unit === "year") return `${n} năm`;
  return null;
}
