import type { Metadata } from "next";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRUONGSON PREMIUM — Quản trị",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-background text-foreground">{children}</div>
    </SessionProviderWrapper>
  );
}
