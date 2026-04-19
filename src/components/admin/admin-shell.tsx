"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import type { AdminIconGlyph } from "@/components/admin/admin-icon";
import { AdminIcon } from "@/components/admin/admin-icon";
import { ShopThemeToggle } from "@/components/shop/theme-toggle";

const nav: readonly {
  href: string;
  label: string;
  icon: AdminIconGlyph;
}[] = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: "dashboard" },
  { href: "/admin/categories", label: "Danh mục", icon: "category" },
  { href: "/admin/products", label: "Sản phẩm", icon: "inventory_2" },
  {
    href: "/admin/settings/contact",
    label: "Liên hệ bán hàng",
    icon: "contact_phone",
  },
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
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-muted/80 p-4 md:flex">
        <div className="px-2 py-4">
          <p className="text-lg font-bold text-foreground">TRUONGSON PREMIUM</p>
          <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
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
                    ? "flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md"
                    : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
                }
              >
                <AdminIcon name={item.icon} className="opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="px-2 text-xs text-muted-foreground">Đã đăng nhập</div>
          <div className="flex items-center justify-between gap-2 px-2">
            <p className="truncate text-sm text-foreground">{userLabel}</p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border px-4 py-4 backdrop-blur-2xl [background:var(--nav-background)] sm:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="bg-gradient-to-r from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] bg-clip-text text-2xl font-black leading-tight text-transparent [font-family:var(--font-be-vietnam),var(--font-inter),system-ui]">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ShopThemeToggle />
              <SignOutButton className="md:hidden" />
            </div>
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
                      ? "whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
                      : "whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
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
