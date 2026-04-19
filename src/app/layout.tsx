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
    default: "TRUONGSON PREMIUM | Tài khoản Premium",
    template: "%s | TRUONGSON PREMIUM",
  },
  description:
    "Nâng cấp trải nghiệm với tài khoản Premium. Giải pháp tiết kiệm chi phí — kích hoạt nhanh, hỗ trợ 24/7.",
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
