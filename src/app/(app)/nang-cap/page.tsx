"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { PLAN_LABEL, PLAN_PRICE_VND, type Plan } from "@/lib/plans";

const PLANS: Plan[] = ["1M", "6M", "1Y"];

interface OrderInfo {
  refCode: string;
  amount: number;
  qrUrl: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
}

export default function NangCapPage() {
  const router = useRouter();
  const activate = useAppStore((s) => s.activate);

  const [plan, setPlan] = useState<Plan>("6M");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleCreateOrder() {
    setError(null);
    if (!/^0\d{9}$/.test(phone.trim())) {
      setError("Số điện thoại không hợp lệ (VD: 0909123456)");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không tạo được đơn hàng");
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus(refCode: string) {
    try {
      const res = await fetch(`/api/orders/${refCode}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== "paid") return;

      const actRes = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refCode }),
      });
      const actData = await actRes.json();
      if (actRes.ok) {
        activate(actData.expiresAt);
        setPaid(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      // Bỏ qua lỗi 1 lần poll — vòng lặp sẽ tự thử lại sau 3 giây.
    }
  }

  useEffect(() => {
    if (!order || paid) return;
    pollRef.current = setInterval(() => checkStatus(order.refCode), 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, paid]);

  if (paid) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Kích hoạt thành công!</h1>
        <p className="mt-2 text-ink-muted">
          Tài khoản đã được nâng cấp gói {PLAN_LABEL[plan]}. Mã kích hoạt cũng đã gửi vào email của bạn.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-xl bg-pine px-6 py-3 font-semibold text-paper hover:bg-pine-dark"
        >
          Bắt đầu soạn giáo án →
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Nâng cấp tài khoản</h1>
      <p className="mt-1 text-sm text-ink-muted">Thanh toán qua chuyển khoản, tự động kích hoạt trong vài giây.</p>

      {!order ? (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`rounded-xl border p-3 text-center transition ${
                  plan === p ? "border-pine bg-pine/10" : "border-ink/10 bg-sand/40"
                }`}
              >
                <div className="text-sm text-ink-muted">{PLAN_LABEL[p]}</div>
                <div className="mt-1 font-semibold text-ink">{PLAN_PRICE_VND[p].toLocaleString("vi-VN")}đ</div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="text-sm text-ink-muted">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0909123456"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
            />
          </div>
          <div className="mt-4">
            <label className="text-sm text-ink-muted">Email nhận mã kích hoạt</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@gmail.com"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
            />
          </div>

          {error && <p className="mt-3 text-sm text-seal">{error}</p>}

          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-pine py-3 font-semibold text-paper hover:bg-pine-dark disabled:opacity-50"
          >
            {loading ? "Đang tạo đơn..." : "Tạo mã QR thanh toán"}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-paper-card p-6 text-center shadow-sm">
          <p className="text-sm text-ink-muted">Quét mã để chuyển khoản đúng số tiền và nội dung</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.qrUrl} alt="Mã QR thanh toán" className="mx-auto mt-4 w-56 rounded-lg border border-ink/10" />

          <div className="mt-4 space-y-1 text-left text-sm">
            <p className="flex justify-between"><span className="text-ink-muted">Ngân hàng</span><span className="font-medium text-ink">{order.bankName}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Chủ TK</span><span className="font-medium text-ink">{order.accountHolder}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Số TK</span><span className="font-medium text-ink">{order.bankAccount}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Nội dung</span><span className="font-semibold text-seal">{order.refCode}</span></p>
            <p className="flex justify-between"><span className="text-ink-muted">Số tiền</span><span className="font-semibold text-ink">{order.amount.toLocaleString("vi-VN")}đ</span></p>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Hệ thống tự động kiểm tra và kích hoạt trong vài giây sau khi nhận được chuyển khoản đúng nội dung.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pine" />
            Đang chờ thanh toán...
          </div>
        </div>
      )}
    </main>
  );
}
