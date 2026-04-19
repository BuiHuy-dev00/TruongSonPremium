import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-be-vietnam",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TRUONGSON PREMIUM | Bảng giá dịch vụ số",
    template: "%s | TRUONGSON PREMIUM",
  },
  description:
    "Bảng giá dịch vụ mạng xã hội & dịch vụ số — báo giá minh bạch, liên hệ trực tiếp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${beVietnam.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#0c0e12] text-[#f6f6fc] antialiased [font-family:var(--font-inter),system-ui]">
        {children}
      </body>
    </html>
  );
}
