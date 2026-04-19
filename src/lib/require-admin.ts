import { auth } from "@/auth";
import { fail } from "@/lib/api-response";
import type { NextResponse } from "next/server";

export async function requireAdminSession(): Promise<
  | { ok: true; adminId: string; email: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  const id = session?.user?.id;
  const email = session?.user?.email;
  if (!id || !email) {
    return {
      ok: false,
      response: fail("Chưa đăng nhập hoặc phiên không hợp lệ", 401),
    };
  }
  return { ok: true, adminId: id, email };
}
