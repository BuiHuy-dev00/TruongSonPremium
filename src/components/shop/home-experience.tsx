"use client";

import Link from "next/link";
import { ProductImage } from "@/components/shop/product-image";
import { useMemo, useState } from "react";
import type { HomePayload } from "@/server/services/catalog.service";
import type { PublicProduct } from "@/server/mappers/product-public";

function mergeCatalog(rows: HomePayload["productsByCategory"]) {
  const map = new Map<string, PublicProduct>();
  for (const row of rows) {
    for (const p of row.products) {
      map.set(p.id, p);
    }
  }
  return [...map.values()];
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** Chỉ dùng thẻ <a> khi là URL http(s) — text tự do không bị ép thành href sai. */
function isHttpUrl(s: string | null | undefined): boolean {
  const t = s?.trim();
  return !!t && /^https?:\/\//i.test(t);
}

function hasContactText(s: string | null | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

function ContactChannelCard({
  href,
  shellClass,
  iconBgClass,
  iconLetter,
  title,
  subtitle,
}: {
  href: string | null | undefined;
  shellClass: string;
  iconBgClass: string;
  iconLetter: string;
  title: string;
  subtitle: string;
}) {
  const inner = (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${iconBgClass}`}
      >
        {iconLetter}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="font-bold">{title}</div>
        <div className="break-all text-xs opacity-90">{subtitle}</div>
      </div>
    </>
  );

  const base =
    `flex items-center gap-4 rounded-xl border p-4 ${shellClass}`.trim();

  if (isHttpUrl(href)) {
    return (
      <a
        href={href!.trim()}
        target="_blank"
        rel="noreferrer"
        className={base}
      >
        {inner}
      </a>
    );
  }

  return <div className={`${base} cursor-default`}>{inner}</div>;
}

export function HomeExperience({ initial }: { initial: HomePayload }) {
  const [modalOpen, setModalOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0c0e12] text-[#f6f6fc]">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0e12]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1920px] items-center px-6 py-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#95aaff] to-[#00e3fd] bg-clip-text text-2xl font-black text-transparent"
          >
            TRUONGSON PREMIUM
          </Link>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-16 pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,82,255,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#95aaff]/20 bg-[#95aaff]/10 px-3 py-1 text-xs font-medium text-[#95aaff]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#95aaff]" />
            Hệ thống dịch vụ số hàng đầu
          </div>
          <h1 className="font-black leading-tight tracking-tighter [font-family:var(--font-be-vietnam),system-ui] text-4xl md:text-6xl">
            Bảng giá dịch vụ{" "}
            <span className="bg-gradient-to-r from-[#95aaff] to-[#00e3fd] bg-clip-text text-transparent">
              Mạng Xã Hội
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg">
            Nâng cấp trải nghiệm với tài khoản Premium.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base">
            Giải pháp tiết kiệm chi phí cho các dịch vụ Premium – kích hoạt nhanh,
            hỗ trợ 24/7.
          </p>
        </div>
      </header>

      <main className="mx-auto mb-24 max-w-7xl space-y-20 px-6">
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                🔥 Sản phẩm Hot nhất
              </h2>
              <p className="text-sm text-slate-500">
                Được khách hàng quan tâm nhiều nhất
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {initial.hotProducts.slice(0, 3).map((p, idx) => (
              <div
                key={p.id}
                className={
                  idx === 0
                    ? "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#111318] p-8 md:col-span-2"
                    : "flex flex-col justify-between rounded-[2.5rem] border border-white/5 bg-[#171a1f] p-6"
                }
              >
                <div className={idx === 0 ? "relative z-10" : ""}>
                  {idx === 0 ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#95aaff]">
                      Bán chạy nhất
                    </span>
                  ) : null}
                  <h3
                    className={
                      idx === 0
                        ? "mt-4 text-3xl font-black text-white"
                        : "text-lg font-bold text-white"
                    }
                  >
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{p.shortDescription}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-black text-[#00e3fd]">
                    {p.priceFormatted}
                    <span className="text-xs font-normal text-slate-500">
                      {" "}
                      {p.priceUnit}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="rounded-xl bg-white px-6 py-2 text-sm font-bold text-black active:scale-95"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="services">
          <div className="mb-10 text-center">
            <h2 className="mb-8 text-4xl font-black text-white [font-family:var(--font-be-vietnam),system-ui]">
              Kho Dịch Vụ Tổng Hợp
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                }}
                className={
                  activeCategory === "all"
                    ? "rounded-full bg-[#95aaff] px-6 py-2 text-sm font-bold text-[#001a63]"
                    : "rounded-full border border-white/5 bg-[#111318] px-6 py-2 text-sm text-slate-400 hover:text-white"
                }
              >
                Tất cả
              </button>
              {initial.categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(c.slug);
                  }}
                  className={
                    activeCategory === c.slug
                      ? "rounded-full bg-[#95aaff] px-6 py-2 text-sm font-bold text-[#001a63]"
                      : "rounded-full border border-white/5 bg-[#111318] px-6 py-2 text-sm text-slate-400 hover:text-white"
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
                className="group overflow-hidden rounded-[2rem] border border-white/12 bg-[#171a1f] shadow-[0_10px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.07] transition hover:border-[#95aaff]/45 hover:shadow-[0_16px_56px_rgba(149,170,255,0.14)] hover:ring-[#95aaff]/25"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#141619]">
                  <ProductImage
                    variant="fill"
                    src={p.imageUrl}
                    alt={p.name}
                    className="transition duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171a1f] via-[#171a1f]/55 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 font-bold transition group-hover:text-[#95aaff]">
                    {p.name}
                  </h3>
                  <p className="mb-6 line-clamp-2 text-xs text-slate-500">
                    {p.shortDescription}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                      <span className="text-xl font-black tabular-nums tracking-tight text-white md:text-2xl">
                        {p.priceFormatted}
                      </span>
                      <span className="text-sm font-semibold leading-none text-slate-400 md:text-base">
                        {p.priceUnit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="rounded-xl bg-[#23262c] px-4 py-2 text-xs font-bold text-[#95aaff] transition hover:bg-[#95aaff] hover:text-[#001a63]"
                    >
                      Mua
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-500">
              Không có sản phẩm phù hợp.
            </p>
          ) : null}
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#1d2025] p-8 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 text-slate-500 hover:text-white"
              onClick={() => setModalOpen(false)}
              aria-label="Đóng"
            >
              <IconClose className="h-6 w-6" />
            </button>
            <h3 className="mb-2 text-center text-2xl font-black">
              Kết nối chuyên viên
            </h3>
            <p className="mb-8 text-center text-sm text-slate-400">
              Chọn kênh liên hệ để được hỗ trợ báo giá &amp; mua hàng nhanh nhất.
            </p>

            <div className="space-y-3">
              {hasContactText(seller.telegramUrl) ||
              hasContactText(seller.telegramHandle) ? (
                <ContactChannelCard
                  href={seller.telegramUrl}
                  shellClass="border-[#0088cc]/20 bg-[#0088cc]/10 text-[#49b3ff] hover:bg-[#0088cc]/20"
                  iconBgClass="bg-[#0088cc]"
                  iconLetter="TG"
                  title="Telegram"
                  subtitle={
                    seller.telegramHandle ??
                    seller.telegramUrl ??
                    ""
                  }
                />
              ) : null}

              {hasContactText(seller.zaloDisplay) ||
              hasContactText(seller.zaloUrl) ? (
                <ContactChannelCard
                  href={seller.zaloUrl}
                  shellClass="border-[#0068ff]/20 bg-[#0068ff]/10 text-[#7ab6ff] hover:bg-[#0068ff]/20"
                  iconBgClass="bg-[#0068ff]"
                  iconLetter="Z"
                  title="Zalo"
                  subtitle={
                    seller.zaloDisplay ?? seller.zaloUrl ?? ""
                  }
                />
              ) : null}

              {hasContactText(seller.facebookUrl) ||
              hasContactText(seller.facebookLabel) ? (
                <ContactChannelCard
                  href={seller.facebookUrl}
                  shellClass="border-[#1877F2]/20 bg-[#1877F2]/10 text-[#8fb7ff] hover:bg-[#1877F2]/20"
                  iconBgClass="bg-[#1877F2]"
                  iconLetter="f"
                  title="Facebook / Messenger"
                  subtitle={
                    seller.facebookLabel ?? seller.facebookUrl ?? ""
                  }
                />
              ) : null}

              {hasContactText(seller.phone) ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                  <span className="text-slate-400">Điện thoại: </span>
                  <span className="font-semibold text-white">
                    {seller.phone?.trim()}
                  </span>
                </div>
              ) : null}
            </div>

            {hasContactText(seller.note) ? (
              <p className="mt-8 whitespace-pre-wrap text-center text-sm leading-relaxed text-slate-300">
                {seller.note?.trim()}
              </p>
            ) : (
              <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Hỗ trợ nhanh • Phản hồi trong giờ hành chính
              </p>
            )}
          </div>
        </div>
      ) : null}

      <footer className="border-t border-white/5 bg-[#111318] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-slate-500 md:flex-row">
          <p>© 2026 TRUONGSON PREMIUM. Nền tảng dịch vụ số chuyên nghiệp.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <span>Điều khoản</span>
            <span>Bảo mật</span>
            <span>Zalo</span>
            <span>Telegram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
