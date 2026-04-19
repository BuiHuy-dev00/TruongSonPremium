"use client";

import { useState } from "react";

/** Ảnh xem trước trong admin: không hiện icon “ảnh vỡ” của trình duyệt khi URL lỗi/404. */
export function AdminProductThumb({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src.trim() || broken) {
    return (
      <div
        className={`flex items-center justify-center bg-[#23262c] text-[10px] font-semibold uppercase tracking-wide text-slate-600 ${className ?? ""}`}
        aria-hidden
      >
        Ảnh
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL tùy ý /uploads hoặc ngoài
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
