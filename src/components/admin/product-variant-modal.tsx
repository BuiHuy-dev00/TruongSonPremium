"use client";

import { useEffect, useState } from "react";
import type { ProductVariant } from "@prisma/client";

export type ProductVariantModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  productId: string;
  variantId?: string;
  /** clone / create initial */
  initial?: Partial<
    Pick<
      ProductVariant,
      "label" | "duration" | "durationUnit" | "price" | "originalPrice" | "note"
    >
  >;
  mode: "create" | "edit";
  onClose: () => void;
  onSaved: () => void;
};

export function ProductVariantModal({
  open,
  title,
  subtitle,
  productId,
  variantId,
  initial,
  mode,
  onClose,
  onSaved,
}: ProductVariantModalProps) {
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? "");
    setDuration(
      initial?.duration != null ? String(initial.duration) : ""
    );
    setPrice(initial?.price != null ? String(initial.price) : "");
    setNote(initial?.note ?? "");
    setError(null);
  }, [open, initial]);

  if (!open) return null;

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

    const durationNum = duration.trim()
      ? Number.parseInt(duration, 10)
      : null;
    if (duration.trim() && (!Number.isFinite(durationNum!) || durationNum! < 1)) {
      setError("Thời hạn (số) không hợp lệ");
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      label: label.trim(),
      price: priceNum,
      duration: durationNum,
      durationUnit: null,
      originalPrice: null,
      note: note.trim() || null,
    };

    const url =
      mode === "edit" && variantId
        ? `/api/admin/products/${productId}/variants/${variantId}`
        : `/api/admin/products/${productId}/variants`;
    const method = mode === "edit" ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!res.ok || !json.success) {
        setError(json.message ?? "Lưu thất bại");
        setLoading(false);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0"
        onClick={() => !loading && onClose()}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#151820] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tên gói / nhãn hiển thị *
            </label>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="VD: 3 tháng"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Thời hạn (số) — tuỳ chọn
            </label>
            <input
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="VD: 3"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Giá bán (VNĐ) *
            </label>
            <input
              required
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ghi chú gói
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#95aaff]"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => !loading && onClose()}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-5 py-2 text-sm font-bold text-[#001a63] disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu biến thể"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
