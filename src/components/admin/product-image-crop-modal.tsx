"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";

/** Cùng tỷ lệ khung ảnh thẻ sản phẩm trên trang chủ (`aspect-[4/3]`). */
const ASPECT = 4 / 3;

type Props = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropped: (blob: Blob) => void;
};

export function ProductImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropped,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setErr(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function apply() {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setErr(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onCropped(blob);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không cắt được ảnh.");
    } finally {
      setBusy(false);
    }
  }

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Đóng"
        onClick={() => !busy && onClose()}
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl border border-white/15 bg-[#151820] p-4 shadow-2xl">
        <h4 className="mb-3 text-sm font-bold text-white">
          Chọn vùng hiển thị (tỉ lệ 4∶3 như thẻ sản phẩm)
        </h4>
        <div className="relative h-[min(52vh,320px)] w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="shrink-0">Thu phóng</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#95aaff]"
          />
        </label>
        {err ? (
          <p className="mt-2 text-xs text-red-400" role="alert">
            {err}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => !busy && onClose()}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            disabled={busy || !croppedAreaPixels}
            onClick={() => void apply()}
            className="rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] px-4 py-2 text-sm font-bold text-[#001a63] disabled:opacity-50"
          >
            {busy ? "Đang xử lý..." : "Áp dụng"}
          </button>
        </div>
      </div>
    </div>
  );
}
