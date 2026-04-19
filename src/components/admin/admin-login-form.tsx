"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ShopThemeToggle } from "@/components/shop/theme-toggle";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Đăng nhập thất bại. Kiểm tra email và mật khẩu.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="relative z-10 flex min-h-screen flex-grow items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
      <div className="fixed right-4 top-4 z-20 md:right-8 md:top-8">
        <ShopThemeToggle />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[30%] w-[30%] rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px]">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] shadow-lg shadow-primary/25"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-primary-foreground dark:text-[#0c0e12]"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] bg-clip-text text-2xl font-bold tracking-tighter text-transparent">
              TRUONGSON PREMIUM
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản trị hệ thống
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-xl md:p-10 dark:bg-card/90">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                className="ml-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                htmlFor="email"
              >
                Tài khoản (email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted py-4 pl-4 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                className="ml-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted py-4 pl-4 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600 dark:text-[#ff6e84]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--gradient-text-from)] to-[var(--gradient-text-to)] py-4 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60 dark:text-[#0a0f1e]"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
