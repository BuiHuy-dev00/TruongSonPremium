"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className={`rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#aaabb0] transition hover:border-white/20 hover:text-white ${className ?? ""}`}
    >
      Đăng xuất
    </button>
  );
}
