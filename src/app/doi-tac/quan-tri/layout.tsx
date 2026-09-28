import type { Metadata } from "next";

// Link riêng chứa khoá bí mật: không cho công cụ tìm kiếm lập chỉ mục và không gửi Referer đi nơi khác.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
