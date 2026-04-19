"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function isDataImageUrl(src: string): boolean {
  return src.startsWith("data:image/");
}

/** Ảnh file cũ dưới /uploads/ — dùng <img> thường. */
function isLocalUpload(src: string): boolean {
  return src.startsWith("/uploads/");
}

type FillProps = {
  variant: "fill";
  src: string;
  alt: string;
  className?: string;
  sizes: string;
};

export function ProductImage(props: FillProps) {
  const { src: rawSrc, alt, className, sizes } = props;
  const src = typeof rawSrc === "string" ? rawSrc.trim() : "";
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const cover = className ? `object-cover ${className}` : "object-cover";

  if (!src) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2d36] via-[#1e2128] to-[#12151a] ${className ?? ""}`}
        aria-hidden
      >
        <span className="select-none text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Ảnh
        </span>
      </div>
    );
  }

  if (broken) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2d36] via-[#1e2128] to-[#12151a] ${className ?? ""}`}
        aria-hidden
      >
        <span className="select-none text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Ảnh
        </span>
      </div>
    );
  }

  if (isDataImageUrl(src) || isLocalUpload(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cover}
      sizes={sizes}
      unoptimized
      onError={() => setBroken(true)}
    />
  );
}
