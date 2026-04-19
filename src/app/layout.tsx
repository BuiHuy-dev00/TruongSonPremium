import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getThemeBlockingScript } from "@/lib/theme-storage";
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
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnam.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBlockingScript() }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300 [font-family:var(--font-inter),system-ui]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
