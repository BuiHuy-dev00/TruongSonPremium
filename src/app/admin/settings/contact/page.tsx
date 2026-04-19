import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SellerContactForm } from "@/components/admin/seller-contact-form";

export default async function SellerContactSettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  return (
    <AdminShell
      title="Liên hệ bán hàng"
      subtitle="Thông tin hiển thị trong popup “Mua” trên storefront."
      userLabel={session.user.email}
    >
      <SellerContactForm />
    </AdminShell>
  );
}
