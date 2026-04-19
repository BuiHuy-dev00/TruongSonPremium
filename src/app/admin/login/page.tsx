import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c0e12] text-[#aaabb0]">
          Đang tải...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
