"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
    <main className="relative z-10 flex min-h-screen flex-grow items-center justify-center overflow-hidden bg-[#0c0e12] p-6 font-sans text-[#f6f6fc]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#95aaff]/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[30%] w-[30%] rounded-full bg-[#00e3fd]/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px]">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#95aaff] to-[#00e3fd] shadow-lg shadow-[#95aaff]/20"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#0c0e12"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-[#95aaff] to-[#00e3fd] bg-clip-text text-2xl font-bold tracking-tighter text-transparent">
              TRUONGSON PREMIUM
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quản trị hệ thống</h1>
          <p className="mt-2 text-sm text-[#aaabb0]">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[rgba(17,19,24,0.7)] p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                className="ml-1 block text-xs font-semibold uppercase tracking-widest text-[#aaabb0]"
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
                className="w-full rounded-xl border border-[#46484d]/30 bg-black py-4 pl-4 pr-4 text-[#f6f6fc] outline-none placeholder:text-[#74757a] focus:border-[#95aaff] focus:ring-2 focus:ring-[#95aaff]/20"
              />
            </div>

            <div className="space-y-2">
              <label
                className="ml-1 block text-xs font-semibold uppercase tracking-widest text-[#aaabb0]"
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
                className="w-full rounded-xl border border-[#46484d]/30 bg-black py-4 pl-4 pr-4 text-[#f6f6fc] outline-none placeholder:text-[#74757a] focus:border-[#95aaff] focus:ring-2 focus:ring-[#95aaff]/20"
              />
            </div>

            {error ? (
              <p className="text-sm text-[#ff6e84]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#95aaff] to-[#00e3fd] py-4 font-bold text-[#001a63] shadow-[0_10px_30px_rgba(149,170,255,0.2)] transition hover:shadow-[0_10px_40px_rgba(0,227,253,0.3)] disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
