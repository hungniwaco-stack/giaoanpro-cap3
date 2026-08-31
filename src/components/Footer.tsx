import Link from "next/link";

const SUPPORT_EMAIL = "hotro@example.com"; // ponytail: thay bằng email hỗ trợ thật
const ZALO_LINK = "https://zalo.me/"; // ponytail: thay bằng link Zalo thật

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-4 py-6 text-center text-xs text-ink-muted">
      <p className="mx-auto max-w-md">
        Nội dung giáo án do AI tạo ra chỉ mang tính tham khảo. Vui lòng kiểm tra lại trước khi
        giảng dạy.
      </p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/dieu-khoan" className="hover:text-pine-dark">Điều khoản sử dụng</Link>
        <Link href="/bao-mat" className="hover:text-pine-dark">Chính sách bảo mật</Link>
        <Link href="/hoan-tien" className="hover:text-pine-dark">Chính sách hoàn tiền</Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-pine-dark">{SUPPORT_EMAIL}</a>
        <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-pine-dark">Zalo hỗ trợ</a>
      </nav>
    </footer>
  );
}
