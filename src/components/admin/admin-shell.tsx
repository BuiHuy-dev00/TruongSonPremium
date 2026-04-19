"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import type { AdminIconGlyph } from "@/components/admin/admin-icon";
import { AdminIcon } from "@/components/admin/admin-icon";

const nav: readonly {
  href: string;
  label: string;
  icon: AdminIconGlyph;
}[] = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: "dashboard" },
  { href: "/admin/categories", label: "Danh mục", icon: "category" },
  { href: "/admin/products", label: "Sản phẩm", icon: "inventory_2" },
  { href: "/admin/settings/contact", label: "Liên hệ bán hàng", icon: "contact_phone" },
];

export function AdminShell({
  title,
  subtitle,
  userLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  userLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-[#111318] p-4 md:flex">
        <div className="px-2 py-4">
          <p className="text-lg font-bold text-white">TRUONGSON PREMIUM</p>
          <p className="text-xs text-slate-500">Quản trị hệ thống</p>
        </div>
        <nav className="mt-2 flex-1 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-xl bg-[#0052FF] px-4 py-3 text-sm text-white shadow-[0_0_20px_rgba(0,82,255,0.3)]"
                    : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                }
              >
                <AdminIcon name={item.icon} className="opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-white/5 pt-4">
          <div className="px-2 text-xs text-slate-500">Đã đăng nhập</div>
          <div className="flex items-center justify-between gap-2 px-2">
            <p className="truncate text-sm text-white">{userLabel}</p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0c0e12]/80 px-4 py-4 backdrop-blur-2xl sm:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div>
              <h1 className="bg-gradient-to-r from-[#95aaff] to-[#00e3fd] bg-clip-text text-2xl font-black leading-tight text-transparent [font-family:var(--font-be-vietnam),var(--font-inter),system-ui]">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-xs text-slate-400">{subtitle}</p>
              ) : null}
            </div>
            <SignOutButton className="md:hidden" />
          </div>
          <div className="mx-auto mt-3 flex max-w-[1600px] gap-2 overflow-x-auto pb-1 md:hidden">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "whitespace-nowrap rounded-full bg-[#0052FF] px-3 py-1 text-xs font-bold text-white"
                      : "whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>
        <div className="mx-auto max-w-[1600px] p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
