"use client";

import { useState } from "react";
import Link from "next/link";
import { AFFILIATE_LIMITS as L } from "@/lib/affiliate-limits";

const inputCls =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine";

export default function AffiliateSignupForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; emailSent: boolean; devLink?: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");
      setDone({ email: String(body.email), emailSent: data.emailSent !== false, devLink: data.devLink });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-pine/30 bg-pine/5 p-6 text-sm text-ink">
        {done.emailSent ? (
          <>
            <p className="font-semibold text-pine-dark">Đã gửi link giới thiệu và link xem số liệu tới {done.email}</p>
            <p className="mt-2 text-ink-muted">Kiểm tra hộp thư (cả mục Spam). Link xem số liệu là link riêng, không chia sẻ cho người khác.</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-pine-dark">Đã ghi nhận đăng ký của bạn</p>
            <p className="mt-2 text-ink-muted">
              Hiện chưa gửi được email tới {done.email}. Vui lòng nhắn Zalo hỗ trợ (ở chân trang) để nhận link giới thiệu và link xem số liệu.
            </p>
          </>
        )}
        {done.devLink && <p className="mt-2 break-all text-xs text-ink-muted">Môi trường thử: {done.devLink}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink-muted">
          Họ tên
          <input name="name" required maxLength={L.name} className={inputCls} />
        </label>
        <label className="text-sm text-ink-muted">
          Email nhận link
          <input name="email" type="email" required maxLength={L.email} className={inputCls} />
        </label>
        <label className="text-sm text-ink-muted">
          Ngân hàng
          <input name="bankName" required maxLength={L.bank} placeholder="Ví dụ: Vietcombank" className={inputCls} />
        </label>
        <label className="text-sm text-ink-muted">
          Số tài khoản
          <input name="accountNumber" required inputMode="numeric" maxLength={L.account} className={inputCls} />
        </label>
      </div>
      <label className="mt-4 block text-sm text-ink-muted">
        Tên chủ tài khoản
        <input name="accountName" required maxLength={L.name} className={inputCls} />
      </label>
      <p className="mt-4 text-xs text-ink-muted">
        Bằng việc đăng ký, bạn đồng ý với{" "}
        <Link href="/doi-tac/dieu-khoan" className="text-pine underline">
          Điều khoản chương trình cộng tác viên
        </Link>
        .
      </p>
      {error && <p className="mt-3 text-sm text-seal">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 w-full rounded-xl bg-pine py-3 font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-50"
      >
        {busy ? "Đang gửi..." : "Đăng ký làm cộng tác viên"}
      </button>
    </form>
  );
}
