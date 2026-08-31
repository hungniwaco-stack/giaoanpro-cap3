import type { Metadata } from "next";
import { Literata, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["vietnamese", "latin"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
});

// ponytail: đổi sang domain thật khi deploy, cần cho OG image tuyệt đối + sitemap.
const SITE_URL = "https://cap3.giaoanpro.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AI Giáo Án Pro — Soạn giáo án THPT chuẩn 5512 bằng AI",
  description:
    "Tạo giáo án THPT lớp 10-12 chuẩn Công văn 5512, sách Kết nối tri thức, xuất thẳng file Word chỉ trong vài giây. Dùng thử miễn phí 2 lượt.",
  keywords: ["giáo án AI", "soạn giáo án", "công văn 5512", "giáo án THPT", "kết nối tri thức"],
  openGraph: {
    title: "AI Giáo Án Pro — Cấp 3",
    description: "Soạn giáo án THPT chuẩn 5512 bằng AI, xuất thẳng file Word.",
    locale: "vi_VN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${literata.variable} ${beVietnam.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
