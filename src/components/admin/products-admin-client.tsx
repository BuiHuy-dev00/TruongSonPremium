"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdminProductThumb } from "@/components/admin/admin-product-thumb";
import { AdminIcon } from "@/components/admin/admin-icon";
import { ProductImageCropModal } from "@/components/admin/product-image-crop-modal";
import { formatVnd } from "@/lib/format";

export type ProductAdminRow = {
  id: string;
  name: string;
  slug: string;
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
  category: { id: string; name: string };
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
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  /** ảnh mới chọn từ máy */
  const [imageFile, setImageFile] = useState<File | null>(null);
  /** xem trước blob khi chọn file */
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  /** URL thủ công (tuỳ chọn) khi không upload file */
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [cropModalOpen, setCropModalOpen] = useState(false);

  /** Giữ URL ảnh lúc mở form sửa — tránh mất imageUrl khi state editing/payload lệch. */
  const editingImageUrlRef = useRef<string>("");

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
    setPrice(String(p.price));
    setPriceUnit(p.priceUnit);
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

    const priceNum = Number.parseInt(price.replace(/\D/g, ""), 10);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Giá không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const fd = new FormData();
        fd.append(
          "file",
          imageFile,
          imageFile.name || "product-upload.jpg"
        );
        let up: Response;
        try {
          up = await fetch("/api/admin/upload", {
            method: "POST",
            credentials: "include",
            body: fd,
          });
        } catch {
          setError("Không kết nối được máy chủ khi tải ảnh");
          setLoading(false);
          return;
        }
        let uploadJson: unknown;
        try {
          uploadJson = await up.json();
        } catch {
          setError("Phản hồi tải ảnh không hợp lệ (có thể hết phiên đăng nhập).");
          setLoading(false);
          return;
        }
        const uj = uploadJson as {
          success?: boolean;
          message?: string;
          data?: unknown;
        };
        const uploadedUrl =
          uj.data &&
          typeof uj.data === "object" &&
          uj.data !== null &&
          "url" in uj.data &&
          typeof (uj.data as { url: unknown }).url === "string"
            ? (uj.data as { url: string }).url.trim()
            : typeof uj.data === "string"
              ? uj.data.trim()
              : "";
        if (!up.ok || !uj.success || !uploadedUrl) {
          setError(uj.message ?? "Tải ảnh lên thất bại");
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
        setError("Thiếu URL ảnh. Hãy chọn ảnh, dán URL, hoặc giữ ảnh hiện tại.");
        setLoading(false);
        return;
      }

      const slugTrim = slug.trim();
      const payload: Record<string, unknown> = {
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        detailDescription: detailDescription.trim() || null,
        price: priceNum,
        priceUnit: priceUnit.trim(),
        imageUrl: finalImageUrl.trim(),
        categoryId,
        isHot,
        isFeatured,
        isVisible,
        sortOrder,
      };
      if (slugTrim) payload.slug = slugTrim;
      const skuTrim = sku.trim();
      payload.sku = skuTrim || null;

      const url = editing
        ? `/api/admin/products/${editing.id}`
        : "/api/admin/products";
      let res: Response;
      try {
        res = await fetch(url, {
          method: editing ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        setError("Không kết nối được máy chủ khi lưu sản phẩm");
        setLoading(false);
        return;
      }
      let json: { success?: boolean; message?: string };
      try {
        json = (await res.json()) as { success?: boolean; message?: string };
      } catch {
        setError("Phản hồi lưu sản phẩm không hợp lệ (có thể hết phiên đăng nhập).");
        setLoading(false);
        return;
      }

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
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return;
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

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Thêm và chỉnh sửa dịch vụ / báo giá hiển thị cho khách.
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

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#111318] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                <th className="px-4 py-4 font-semibold">Ảnh</th>
                <th className="px-4 py-4 font-semibold">Tên</th>
                <th className="px-4 py-4 font-semibold">Giá</th>
                <th className="px-4 py-4 font-semibold">Đơn vị</th>
                <th className="px-4 py-4 font-semibold">Danh mục</th>
                <th className="px-4 py-4 font-semibold">Hot</th>
                <th className="px-4 py-4 font-semibold">Hiển thị</th>
                <th className="px-4 py-4 font-semibold text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <AdminProductThumb
                      src={p.imageUrl}
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                  </td>
                  <td className="max-w-[200px] px-4 py-3 font-semibold text-white">
                    <span className="line-clamp-2">{p.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#95aaff]">
                    {formatVnd(p.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {p.priceUnit}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3">
                    {p.isHot ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00e3fd]">
                        <AdminIcon name="local_fire_department" size={16} />
                        Hot
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.isVisible ? (
                      <span className="text-[#00e3fd]">Bật</span>
                    ) : (
                      <span className="text-slate-500">Ẩn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50"
                      >
                        <AdminIcon name="pencil" size={16} />
                        Sửa
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !loading && closeModal()}
          />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#151820] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h3>
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tên *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
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
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
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
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Giá (VNĐ) *
                  </label>
                  <input
                    required
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="VD: 150000"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Đơn vị giá *
                  </label>
                  <input
                    required
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    placeholder="/ gói"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ảnh *
                </label>
                <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-6 text-center transition hover:border-[#95aaff]/40">
                  <span className="text-sm text-slate-400">
                    Chọn ảnh từ máy (JPG, PNG, WebP, GIF, AVIF, BMP, SVG — tối đa
                    5MB). Ảnh được mã hóa base64 và lưu trong cơ sở dữ liệu. Hoặc
                    dán URL ảnh https.
                  </span>
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
                    {imageFile ? imageFile.name : "Nhấn để chọn file"}
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
                      className="h-24 w-24 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-xs text-slate-500">
                        {editing && !imageFile && !manualImageUrl.trim()
                          ? "Đang dùng ảnh hiện tại. Chọn file mới để thay."
                          : "Xem trước"}
                      </p>
                      <button
                        type="button"
                        disabled={!cropSourceUrl()}
                        onClick={() => setCropModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#95aaff]/35 bg-[#95aaff]/10 px-3 py-2 text-xs font-semibold text-[#95aaff] transition hover:bg-[#95aaff]/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AdminIcon name="crop" size={16} />
                        Cắt vùng hiển thị (4∶3)
                      </button>
                      <p className="text-[11px] leading-snug text-slate-600">
                        Ảnh sau khi cắt được lưu dạng JPG rồi tải lên. Ảnh URL
                        ngoài site có thể không cắt được do chính sách CORS của
                        máy chủ ảnh — hãy tải file về máy rồi chọn lại.
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hoặc dán URL ảnh (tuỳ chọn)
                  </label>
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => {
                      setManualImageUrl(e.target.value);
                      if (e.target.value.trim()) setImageFile(null);
                    }}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#95aaff]"
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
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
                  <span className="text-sm text-slate-300">Hot</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-[#95aaff]"
                  />
                  <span className="text-sm text-slate-300">Nổi bật</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="h-4 w-4 accent-[#95aaff]"
                  />
                  <span className="text-sm text-slate-300">Hiển thị</span>
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
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
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
