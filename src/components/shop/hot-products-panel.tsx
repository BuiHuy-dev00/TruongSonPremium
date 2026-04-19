"use client";

import { useLayoutEffect, useRef } from "react";
import type { PublicProduct } from "@/types/product-public";

type Props = {
  products: PublicProduct[];
  onBuy: (p: PublicProduct) => void;
};

/**
 * Hai thẻ sản phẩm Hot cùng chiều rộng trong vùng cuộn; khe = gap-4.
 * `100cqw` = chiều rộng panel (container query).
 */
export function HotProductsPanel({ products, onBuy }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      const node = viewportRef.current;
      if (!node) return;
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if (node.scrollWidth <= node.clientWidth + 1) return;
      e.preventDefault();
      node.scrollLeft += e.deltaY;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [products.length]);

  if (products.length === 0) return null;

  const single = products.length === 1;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-muted/40 p-3 shadow-[var(--shadow-card)] sm:p-4 dark:bg-muted/25">
      <div
        ref={viewportRef}
        className="@container [container-type:inline-size] flex max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-1 [-ms-overflow-style:auto] [scrollbar-color:rgba(79,70,229,0.35)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(149,170,255,0.4)_transparent]"
      >
        {products.map((p, idx) => (
          <article
            key={p.id}
            className={
              single
                ? "group flex w-full min-w-full shrink-0 snap-start flex-col justify-between rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)] sm:p-6"
                : "group flex w-[calc((100cqw-1rem)/2)] min-w-[calc((100cqw-1rem)/2)] shrink-0 snap-start flex-col justify-between rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)] sm:p-6"
            }
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {idx === 0 ? (
                  <span className="rounded-full bg-gradient-to-r from-red-500/90 to-orange-500/90 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                    Bán chạy nhất
                  </span>
                ) : null}
                {p.isFeatured ? (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Nổi bật
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 break-words text-lg font-black leading-tight text-card-foreground sm:text-xl">
                {p.name}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {p.shortDescription}
              </p>
            </div>
            <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-border/80 pt-4">
              <span className="min-w-0 break-words text-lg font-black tabular-nums leading-tight text-accent sm:text-2xl">
                {p.priceRangeLabel}
              </span>
              <button
                type="button"
                onClick={() => onBuy(p)}
                className="w-full shrink-0 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-[0.99] sm:w-auto sm:self-start"
              >
                Mua ngay
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
