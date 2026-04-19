"use client";

import { useEffect, useState } from "react";
import { formatPricePlainVnd } from "@/lib/product-price";
import type { PublicProduct, PublicVariant } from "@/types/product-public";

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

function isHttpUrl(s: string | null | undefined): boolean {
  const t = s?.trim();
  return !!t && /^https?:\/\//i.test(t);
}

function hasContactText(s: string | null | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

function variantOptionTitle(v: PublicVariant): string {
  const label = v.label.trim() || "Gói";
  return `${label} - ${formatPricePlainVnd(v.price)}`;
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

export type SellerContactProps = {
  telegramUrl: string | null;
  telegramHandle: string | null;
  zaloDisplay: string | null;
  zaloUrl: string | null;
  facebookUrl: string | null;
  facebookLabel: string | null;
  phone: string | null;
  note: string | null;
};

type Props = {
  product: PublicProduct | null;
  seller: SellerContactProps;
  onClose: () => void;
};

export function ShopPurchaseModal({ product, seller, onClose }: Props) {
  const [selected, setSelected] = useState<PublicVariant | null>(null);

  useEffect(() => {
    if (product && product.variants.length === 1) {
      setSelected(product.variants[0]!);
    } else {
      setSelected(null);
    }
  }, [product]);

  if (!product) return null;

  const variants = product.variants;
  const needPick = variants.length > 1;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 [background:var(--overlay)] backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div
        className="absolute left-1/2 top-1/2 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border p-6 shadow-2xl md:p-8 [border-color:var(--modal-border)] [background:var(--modal-background)]"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground"
          onClick={onClose}
          aria-label="Đóng"
        >
          <IconClose className="h-6 w-6" />
        </button>

        <h3 className="pr-10 text-center text-xl font-black text-foreground md:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Chọn gói phù hợp, sau đó liên hệ để được hỗ trợ.
        </p>

        {variants.length > 0 ? (
          <div className="mt-8">
            <h4 className="text-center text-base font-bold tracking-tight text-foreground">
              Thông tin các gói
            </h4>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {variants.map((v) => {
                const active = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelected(v)}
                    className={`rounded-2xl border px-4 py-3 text-center transition ${
                      active
                        ? "border-primary bg-primary/10 ring-2 ring-ring"
                        : "border-border bg-muted/80 hover:border-primary/40 hover:bg-muted"
                    }`}
                  >
                    <span className="block text-sm font-semibold leading-snug text-foreground">
                      {variantOptionTitle(v)}
                    </span>
                    {v.originalPrice != null ? (
                      <span className="mt-1 block text-xs text-muted-foreground line-through">
                        {formatPricePlainVnd(v.originalPrice)}
                      </span>
                    ) : null}
                    {v.note ? (
                      <span className="mt-1.5 block text-xs text-muted-foreground">
                        {v.note}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {needPick && !selected ? (
          <p className="mt-5 text-center text-sm text-amber-600 dark:text-amber-200/90">
            Vui lòng chọn một gói để tiếp tục.
          </p>
        ) : null}

        {selected ? (
          <>
            <h4 className="mt-10 text-center text-lg font-black text-foreground">
              Kết nối chuyên viên
            </h4>

            <div className="mt-6 space-y-3">
              {hasContactText(seller.telegramUrl) ||
              hasContactText(seller.telegramHandle) ? (
                <ContactChannelCard
                  href={seller.telegramUrl}
                  shellClass="border-[#0088cc]/20 bg-[#0088cc]/10 text-[#49b3ff] hover:bg-[#0088cc]/20"
                  iconBgClass="bg-[#0088cc]"
                  iconLetter="TG"
                  title="Telegram"
                  subtitle={
                    seller.telegramHandle ?? seller.telegramUrl ?? ""
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
                  subtitle={seller.zaloDisplay ?? seller.zaloUrl ?? ""}
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
                  subtitle={seller.facebookLabel ?? seller.facebookUrl ?? ""}
                />
              ) : null}

              {hasContactText(seller.phone) ? (
                <div className="rounded-xl border border-border bg-muted p-4 text-sm">
                  <span className="text-muted-foreground">Điện thoại: </span>
                  <span className="font-semibold text-foreground">
                    {seller.phone?.trim()}
                  </span>
                </div>
              ) : null}
            </div>

            {hasContactText(seller.note) ? (
              <p className="mt-6 whitespace-pre-wrap text-center text-sm leading-relaxed text-muted-foreground">
                {seller.note?.trim()}
              </p>
            ) : (
              <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Hỗ trợ nhanh • Phản hồi trong giờ hành chính
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
