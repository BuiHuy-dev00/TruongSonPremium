import { fail } from "@/lib/api-response";
import type { NextResponse } from "next/server";

export function mapServiceError(err: unknown): NextResponse | null {
  if (!err || typeof err !== "object") {
    return null;
  }
  const code =
    "code" in err && typeof (err as { code?: unknown }).code === "string"
      ? (err as { code: string }).code
      : undefined;
  const message = err instanceof Error ? err.message : "Lỗi không xác định";

  switch (code) {
    case "NOT_FOUND":
      return fail(message, 404);
    case "NAME_CONFLICT":
      return fail(message, 409);
    case "HAS_PRODUCTS":
      return fail(message, 409);
    case "BAD_CATEGORY":
      return fail(message, 400);
    case "LAST_VARIANT":
      return fail(message, 400);
    case "BAD_INPUT":
      return fail(message, 400);
    default:
      return null;
  }
}
