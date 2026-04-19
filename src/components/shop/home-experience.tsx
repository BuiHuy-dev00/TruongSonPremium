"use client";

import Link from "next/link";
import { ProductImage } from "@/components/shop/product-image";
import { ShopPurchaseModal } from "@/components/shop/shop-purchase-modal";
import { HotProductsPanel } from "@/components/shop/hot-products-panel";
import { ShopThemeToggle } from "@/components/shop/theme-toggle";
import { useMemo, useState } from "react";
import type { HomePayload } from "@/server/services/catalog.service";
import type { PublicProduct } from "@/types/product-public";

function mergeCatalog(rows: HomePayload["productsByCategory"]) {
  const map = new Map<string, PublicProduct>();
  for (const row of rows) {
    for (const p of row.products) {
      map.set(p.id, p);
    }
  }
  return [...map.values()];
}

export function HomeExperience({ initial }: { initial: HomePayload }) {
  const [purchaseProduct, setPurchaseProduct] = useState<PublicProduct | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const merged = useMemo(
    () => mergeCatalog(initial.productsByCategory),
    [initial.productsByCategory]
  );

  const filtered = useMemo(() => {
    if (activeCategory === "all") return merged;
    return merged.filter((p) => p.category.slug === activeCategory);
  }, [activeCategory, merged]);

  const seller = initial.sellerContact;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border shadow-[var(--shadow-nav)] [background:var(--nav-background)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="bg-gradient-to-r from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] bg-clip-text text-xl font-black text-transparent sm:text-2xl"
          >
            TRUONGSON PREMIUM
          </Link>
          <ShopThemeToggle />
        </div>
      </nav>

      <header className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/80 to-background pt-14 pb-20 md:pt-20 md:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] px-4 py-1.5 text-xs font-semibold text-primary dark:border-primary/30 dark:bg-primary/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Hệ thống dịch vụ số hàng đầu
            </div>
          </div>
          <h1 className="mx-auto max-w-4xl font-black leading-[1.1] tracking-tighter text-foreground [font-family:var(--font-be-vietnam),system-ui] text-[2rem] sm:text-5xl md:text-6xl">
            Nâng cấp trải nghiệm với{" "}
            <span className="bg-gradient-to-r from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] bg-clip-text text-transparent">
              tài khoản Premium
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Giải pháp tiết kiệm chi phí cho các dịch vụ Premium — kích hoạt nhanh,
            hỗ trợ 24/7. Chọn gói phù hợp, liên hệ và nhận tài khoản chính hãng.
          </p>
        </div>
      </header>

      <main className="mx-auto mb-24 max-w-7xl space-y-20 px-4 sm:px-6">
        {initial.hotProducts.length > 0 ? (
          <section className="pt-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Sản phẩm Hot
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Được khách hàng quan tâm nhiều nhất — hiển thị 2 gói mỗi hàng, kéo
                hoặc lăn chuột ngang để xem thêm.
              </p>
            </div>
            <HotProductsPanel
              products={initial.hotProducts}
              onBuy={setPurchaseProduct}
            />
          </section>
        ) : null}

        <section id="services" className="scroll-mt-24">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-black tracking-tight text-foreground [font-family:var(--font-be-vietnam),system-ui] md:text-4xl">
              Kho dịch vụ tổng hợp
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground md:text-base">
              Lọc theo danh mục — giá hiển thị là một gói hoặc khoảng giá khi có nhiều
              gói.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={
                  activeCategory === "all"
                    ? "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25"
                    : "rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-foreground"
                }
              >
                Tất cả
              </button>
              {initial.categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.slug)}
                  className={
                    activeCategory === c.slug
                      ? "rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25"
                      : "rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-foreground"
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card text-card-foreground shadow-[var(--shadow-card)] ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] dark:ring-white/[0.06]"
              >
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden border-b border-border bg-muted">
                  <ProductImage
                    variant="fill"
                    src={p.imageUrl}
                    alt={p.name}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="pointer-events-none absolute left-3 top-3 z-[1] flex flex-wrap gap-1.5 drop-shadow-sm">
                    {p.isHot ? (
                      <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
                        Hot
                      </span>
                    ) : null}
                    {p.isFeatured ? (
                      <span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        Phổ biến
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-2 font-bold leading-snug transition group-hover:text-primary">
                    {p.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {p.shortDescription}
                  </p>
                  <div className="flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <span className="block text-lg font-black tabular-nums tracking-tight text-accent md:text-xl">
                        {p.priceRangeLabel}
                      </span>
                      {p.hasMultiplePrices ? (
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                          Nhiều gói — bấm Mua để chọn
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPurchaseProduct(p)}
                      className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      Mua
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Không có sản phẩm phù hợp.
            </p>
          ) : null}
        </section>
      </main>

      <ShopPurchaseModal
        product={purchaseProduct}
        seller={seller}
        onClose={() => setPurchaseProduct(null)}
      />

      <footer className="border-t border-border [background:var(--footer-background)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-xs text-muted-foreground sm:px-6 md:flex-row">
          <p className="text-center md:text-left">
            © 2026 TRUONGSON PREMIUM. Nền tảng dịch vụ số chuyên nghiệp.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="cursor-default hover:text-foreground">Điều khoản</span>
            <span className="cursor-default hover:text-foreground">Bảo mật</span>
            <span className="cursor-default hover:text-foreground">Zalo</span>
            <span className="cursor-default hover:text-foreground">Telegram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
