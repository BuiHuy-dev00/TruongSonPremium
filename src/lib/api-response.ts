import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
  pagination?: ApiPagination;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export function ok<T>(
  data: T,
  init?: { status?: number; message?: string; pagination?: ApiPagination }
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true as const,
      message: init?.message,
      data,
      ...(init?.pagination ? { pagination: init.pagination } : {}),
    },
    { status: init?.status ?? 200 }
  );
}

export function fail(
  message: string,
  status: number,
  errors?: Record<string, string[] | undefined>
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export function fromZodError(error: ZodError): ApiErrorBody {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    errors[key] = errors[key] ?? [];
    errors[key].push(issue.message);
  }
  return {
    success: false,
    message: "Dữ liệu không hợp lệ",
    errors,
  };
}
