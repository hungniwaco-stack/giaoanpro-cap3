"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/store/useProfileStore";

const MAIN_NAV = [
  { href: "/", label: "Soạn Giáo Án", icon: "📄" },
  { href: "/de-thi", label: "Thiết Kế Đề Thi", icon: "📝" },
  { href: "/bai-tap", label: "Tạo Bài Tập", icon: "✏️" },
  { href: "/chat", label: "Trò Chuyện AI", icon: "💬" },
];

const MANAGE_NAV = [
  { href: "/lich-su", label: "Lịch Sử Soạn Thảo", icon: "🕘" },
  { href: "/cau-hinh", label: "Cấu Hình Cá Nhân", icon: "⚙️" },
];

function NavLink({
  href, label, icon, active, onNavigate,
}: { href: string; label: string; icon: string; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active ? "bg-pine text-paper font-medium" : "text-ink-muted hover:bg-sand"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { name, school } = useProfileStore();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-ink/10 bg-paper-card px-4 py-6 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" onClick={onClose} className="flex items-center gap-2 px-2">
          <span className="font-display text-xl font-semibold text-pine">✎ AI Giáo Án Pro</span>
        </Link>

        <Link
          href="/cau-hinh"
          onClick={onClose}
          className="mt-6 flex items-center gap-3 rounded-xl border border-ink/10 bg-sand/60 px-3 py-3 hover:bg-sand"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-semibold text-paper"
            suppressHydrationWarning
          >
            {name.trim().charAt(0).toUpperCase() || "G"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink" suppressHydrationWarning>{name}</span>
            <span className="block truncate text-xs text-ink-muted" suppressHydrationWarning>
              {school || "Chưa cập nhật trường"}
            </span>
          </span>
        </Link>

        <p className="mt-8 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted/70">
          Chức năng chính
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </nav>

        <p className="mt-6 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted/70">
          Quản lý
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {MANAGE_NAV.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2 px-2 text-xs text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-pine" />
            AI Agent sẵn sàng
          </div>
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 px-2 text-xs text-ink-muted/70">
            <Link href="/dieu-khoan" className="hover:text-pine-dark">Điều khoản</Link>
            <span>·</span>
            <Link href="/bao-mat" className="hover:text-pine-dark">Bảo mật</Link>
            <span>·</span>
            <Link href="/hoan-tien" className="hover:text-pine-dark">Hoàn tiền</Link>
          </div>
        </div>
      </aside>
    </>
  );
}
