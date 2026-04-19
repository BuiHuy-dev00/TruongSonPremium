"use client";

import type { Category, Product, ProductVariant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdminProductThumb } from "@/components/admin/admin-product-thumb";
import { AdminIcon } from "@/components/admin/admin-icon";
import { ProductImageCropModal } from "@/components/admin/product-image-crop-modal";
import { ProductVariantModal } from "@/components/admin/product-variant-modal";
import {
  formatPricePlainVnd,
  formatProductPriceRange,
} from "@/lib/product-price";
import { formatVnd } from "@/lib/format";

export type ProductAdminRow = Product & {
  category: Pick<Category, "id" | "name">;
  variants: ProductVariant[];
};

export type CategoryOption = { id: string; name: string };

export function ProductsAdminClient({
  products: initialProducts,
  categoryOptions,
}: {
  products: ProductAdminRow[];
  categoryOptions: CategoryOption[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAdminRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  /** Chỉ dùng khi tạo mới — biến thể đầu tiên */
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const editingImageUrlRef = useRef<string>("");

  /** Modal danh sách gói — chọn gói để mở form sửa biến thể */
  const [packagesModalProduct, setPackagesModalProduct] =
    useState<ProductAdminRow | null>(null);
  const [variantModal, setVariantModal] = useState<{
    product: ProductAdminRow;
    mode: "create" | "edit";
    variant?: ProductVariant;
  } | null>(null);

  function cropSourceUrl(): string | null {
    if (filePreviewUrl) return filePreviewUrl;
    const manual = manualImageUrl.trim();
    if (manual) return manual;
    if (editing?.imageUrl) return editing.imageUrl;
    return null;
  }

  useEffect(() => {
    if (!imageFile) {
      setFilePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function priceRangeForRow(p: ProductAdminRow): string {
    const prices = p.variants.map((v) => v.price);
    if (prices.length === 0) return formatVnd(p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return formatProductPriceRange(min, max);
  }

  function resetForm() {
    editingImageUrlRef.current = "";
    setName("");
    setSlug("");
    setSku("");
    setShortDescription("");
    setDetailDescription("");
    setPrice("");
    setPriceUnit("");
    setImageFile(null);
    setManualImageUrl("");
    setCategoryId(categoryOptions[0]?.id ?? "");
    setIsHot(false);
    setIsFeatured(false);
    setIsVisible(true);
    setSortOrder(0);
    setEditing(null);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setPriceUnit("/ gói");
    setOpen(true);
  }

  function openEdit(p: ProductAdminRow) {
    setEditing(p);
    editingImageUrlRef.current = p.imageUrl?.trim() ?? "";
    setName(p.name);
    setSlug(p.slug);
    setSku(p.sku ?? "");
    setShortDescription(p.shortDescription);
    setDetailDescription(p.detailDescription ?? "");
    setImageFile(null);
    setManualImageUrl("");
    setCategoryId(p.categoryId);
    setIsHot(p.isHot);
    setIsFeatured(p.isFeatured);
    setIsVisible(p.isVisible);
    setSortOrder(p.sortOrder);
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const fd = new FormData();
        fd.append(
          "file",
          imageFile,
          imageFile.name || "product-upload.jpg"
        );
        const up = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const uploadJson = (await up.json()) as {
          success?: boolean;
          message?: string;
          data?: unknown;
        };
        const uploadedUrl =
          uploadJson.data &&
          typeof uploadJson.data === "object" &&
          uploadJson.data !== null &&
          "url" in uploadJson.data &&
          typeof (uploadJson.data as { url: unknown }).url === "string"
            ? (uploadJson.data as { url: string }).url.trim()
            : typeof uploadJson.data === "string"
              ? uploadJson.data.trim()
              : "";
        if (!up.ok || !uploadJson.success || !uploadedUrl) {
          setError(uploadJson.message ?? "Tải ảnh lên thất bại");
          setLoading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      } else if (manualImageUrl.trim()) {
        finalImageUrl = manualImageUrl.trim();
      } else if (editing) {
        finalImageUrl =
          editingImageUrlRef.current.trim() ||
          (typeof editing.imageUrl === "string" ? editing.imageUrl.trim() : "");
      } else {
        setError("Chọn ảnh từ máy hoặc nhập URL ảnh");
        setLoading(false);
        return;
      }

      if (!finalImageUrl.trim()) {
        setError("Thiếu URL ảnh.");
        setLoading(false);
        return;
      }

      const slugTrim = slug.trim();
      const basePayload: Record<string, unknown> = {
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        detailDescription: detailDescription.trim() || null,
        imageUrl: finalImageUrl.trim(),
        categoryId,
        isHot,
        isFeatured,
        isVisible,
        sortOrder,
      };
      if (slugTrim) basePayload.slug = slugTrim;
      basePayload.sku = sku.trim() || null;

      if (!editing) {
        const priceNum = Number.parseInt(price.replace(/\D/g, ""), 10);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          setError("Giá biến thể đầu tiên không hợp lệ");
          setLoading(false);
          return;
        }
        const label = priceUnit.trim() || "Mặc định";
        basePayload.variants = [
          {
            label,
            price: priceNum,
            duration: null,
            durationUnit: null,
            originalPrice: null,
            note: null,
            sortOrder: 0,
          },
        ];
      }

      const url = editing
        ? `/api/admin/products/${editing.id}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!res.ok || !json.success) {
        setError(json.message ?? "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      closeModal();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(p: ProductAdminRow) {
    if (!confirm(`Xóa sản phẩm "${p.name}" (tất cả biến thể)?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) {
        alert(json.message ?? "Không xóa được");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function openCloneVariant(p: ProductAdminRow) {
    const tmpl = p.variants[0];
    if (!tmpl) {
      alert("Sản phẩm chưa có biến thể.");
      return;
    }
    setPackagesModalProduct(null);
    setVariantModal({
      product: p,
      mode: "create",
      variant: tmpl,
    });
  }

  function variantRowLabel(v: ProductVariant): string {
    const label = v.label.trim() || "Gói";
    return `${label} - ${formatPricePlainVnd(v.price)}`;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Mỗi sản phẩm có thể có nhiều gói / biến thể giá. Dùng{" "}
          <strong className="text-foreground">Clone</strong> để thêm gói mới từ
          gói mẫu.
        </p>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading || categoryOptions.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-5 py-2.5 text-sm font-bold text-[#001a63] shadow-lg shadow-[#95aaff]/15 disabled:opacity-50"
        >
          <AdminIcon name="plus" size={18} />
          Thêm sản phẩm
        </button>
      </div>

      {categoryOptions.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Chưa có danh mục nào. Hãy tạo danh mục trước khi thêm sản phẩm.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/60 text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-4 font-semibold">Ảnh</th>
                <th className="px-3 py-4 font-semibold">Tên</th>
                <th className="px-3 py-4 font-semibold text-center">
                  Biến thể
                </th>
                <th className="px-3 py-4 font-semibold">Khoảng giá</th>
                <th className="px-3 py-4 font-semibold">Danh mục</th>
                <th className="px-3 py-4 font-semibold">Hot</th>
                <th className="px-3 py-4 font-semibold">Hiển thị</th>
                <th className="px-3 py-4 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="px-3 py-3">
                    <AdminProductThumb
                      src={p.imageUrl}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                  </td>
                  <td className="max-w-[200px] px-3 py-3 font-semibold text-foreground">
                    <span className="line-clamp-2">{p.name}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-bold text-[#00e3fd]">
                    {p.variants.length}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-[#95aaff]">
                    {priceRangeForRow(p)}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted-foreground">
                    {p.category.name}
                  </td>
                  <td className="px-3 py-3">
                    {p.isHot ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00e3fd]">
                        <AdminIcon
                          name="local_fire_department"
                          size={16}
                        />
                        Hot
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {p.isVisible ? (
                      <span className="text-[#00e3fd]">Bật</span>
                    ) : (
                      <span className="text-slate-500">Ẩn</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 disabled:opacity-50"
                      >
                        <AdminIcon name="pencil" size={16} />
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => setPackagesModalProduct(p)}
                        disabled={loading || p.variants.length === 0}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-500/20 disabled:opacity-40 dark:text-cyan-200"
                      >
                        <AdminIcon name="more_vert" size={16} />
                        Gói
                      </button>

                      <button
                        type="button"
                        onClick={() => openCloneVariant(p)}
                        disabled={loading || p.variants.length === 0}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#95aaff]/35 bg-[#95aaff]/10 px-3 py-1.5 text-xs font-semibold text-[#95aaff] hover:bg-[#95aaff]/20 disabled:opacity-40"
                      >
                        <AdminIcon name="copy" size={16} />
                        Clone
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <AdminIcon name="trash" size={16} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 [background:var(--overlay)] backdrop-blur-sm">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !loading && closeModal()}
          />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              {editing ? "Sửa sản phẩm (thông tin chung)" : "Thêm sản phẩm"}
            </h3>
            {editing ? (
              <p className="mt-2 text-sm text-slate-400">
                Giá theo từng gói: dùng nút <strong>Gói</strong> hoặc{" "}
                <strong>Clone</strong> trên dòng sản phẩm.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Nhập biến thể đầu tiên — sau đó có thể Clone để thêm gói khác.
              </p>
            )}
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tên *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Slug (tuỳ chọn)
                  </label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mô tả ngắn *
                </label>
                <input
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Chi tiết (tuỳ chọn)
                </label>
                <textarea
                  value={detailDescription}
                  onChange={(e) => setDetailDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>

              {!editing ? (
                <div className="rounded-xl border border-[#95aaff]/25 bg-[#95aaff]/10 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#95aaff]">
                    Biến thể đầu tiên
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        Nhãn gói *
                      </label>
                      <input
                        required
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value)}
                        placeholder="/ tháng, 1 tháng..."
                        className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        Giá (VNĐ) *
                      </label>
                      <input
                        required
                        inputMode="numeric"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ảnh *
                </label>
                <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center transition hover:border-primary/40">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setImageFile(f);
                      if (f) setManualImageUrl("");
                    }}
                  />
                  <span className="text-xs font-semibold text-[#95aaff]">
                    {imageFile ? imageFile.name : "Chọn ảnh"}
                  </span>
                </label>
                {(filePreviewUrl ||
                  manualImageUrl.trim() ||
                  editing?.imageUrl) && (
                  <div className="flex flex-wrap items-center gap-4">
                    <AdminProductThumb
                      src={
                        filePreviewUrl ||
                        manualImageUrl.trim() ||
                        editing?.imageUrl ||
                        ""
                      }
                      className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
                    />
                    <button
                      type="button"
                      disabled={!cropSourceUrl()}
                      onClick={() => setCropModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#95aaff]/35 bg-[#95aaff]/10 px-3 py-2 text-xs font-semibold text-[#95aaff] disabled:opacity-40"
                    >
                      <AdminIcon name="crop" size={16} />
                      Cắt ảnh (4∶3)
                    </button>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs text-slate-500">
                    Hoặc URL ảnh
                  </label>
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => {
                      setManualImageUrl(e.target.value);
                      if (e.target.value.trim()) setImageFile(null);
                    }}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Danh mục *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(Number.parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isHot}
                    onChange={(e) => setIsHot(e.target.checked)}
                    className="h-4 w-4 accent-[#95aaff]"
                  />
                  <span className="text-sm text-muted-foreground">Hot</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-[#95aaff]"
                  />
                  <span className="text-sm text-muted-foreground">Nổi bật</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="h-4 w-4 accent-[#95aaff]"
                  />
                  <span className="text-sm text-muted-foreground">Hiển thị</span>
                </label>
              </div>

              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !loading && closeModal()}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-5 py-2 text-sm font-bold text-[#001a63] disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {packagesModalProduct ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 [background:var(--overlay)] backdrop-blur-sm"
            onClick={() => setPackagesModalProduct(null)}
          />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8"
            role="dialog"
            aria-labelledby="packages-modal-title"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setPackagesModalProduct(null)}
              aria-label="Đóng"
            >
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <h4
              id="packages-modal-title"
              className="pr-10 text-center text-lg font-bold text-foreground"
            >
              Thông tin các gói
            </h4>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {packagesModalProduct.name}
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Chọn một gói để chỉnh sửa giá và thời hạn.
            </p>
            <div className="mt-6 grid max-h-[min(60vh,420px)] grid-cols-1 gap-2.5 overflow-y-auto sm:grid-cols-2">
              {packagesModalProduct.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    const prod = packagesModalProduct;
                    setPackagesModalProduct(null);
                    setVariantModal({
                      product: prod,
                      mode: "edit",
                      variant: v,
                    });
                  }}
                  className="rounded-2xl border border-border bg-muted/80 px-4 py-3 text-center text-sm font-semibold leading-snug text-foreground transition hover:border-primary/50 hover:bg-muted"
                >
                  {variantRowLabel(v)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {variantModal ? (
        <ProductVariantModal
          open
          title={
            variantModal.mode === "edit"
              ? "Sửa biến thể / gói"
              : "Clone biến thể sản phẩm"
          }
          subtitle={`Sản phẩm: ${variantModal.product.name}`}
          productId={variantModal.product.id}
          variantId={
            variantModal.mode === "edit"
              ? variantModal.variant?.id
              : undefined
          }
          mode={variantModal.mode === "edit" ? "edit" : "create"}
          initial={
            variantModal.variant
              ? {
                  label:
                    variantModal.mode === "create"
                      ? `${variantModal.variant.label} (bản sao)`
                      : variantModal.variant.label,
                  duration: variantModal.variant.duration,
                  durationUnit: variantModal.variant.durationUnit,
                  price: variantModal.variant.price,
                  originalPrice: variantModal.variant.originalPrice,
                  note: variantModal.variant.note ?? "",
                }
              : undefined
          }
          onClose={() => setVariantModal(null)}
          onSaved={() => router.refresh()}
        />
      ) : null}

      <ProductImageCropModal
        open={cropModalOpen}
        imageSrc={cropModalOpen ? cropSourceUrl() : null}
        onClose={() => setCropModalOpen(false)}
        onCropped={(blob) => {
          const file = new File([blob], `product-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setImageFile(file);
          setManualImageUrl("");
          setCropModalOpen(false);
        }}
      />
    </>
  );
}
