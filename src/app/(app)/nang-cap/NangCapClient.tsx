"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { PLAN_LABEL, PLAN_PRICE_VND, type Plan } from "@/lib/plans";
import { trackPurchase } from "@/lib/pixel";

const PLANS: Plan[] = ["1M", "6M", "1Y"];

interface OrderInfo {
  plan: Plan;
  refCode: string;
  amount: number;
  qrUrl: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
}

export default function NangCapClient({ initialPlan }: { initialPlan: Plan }) {
  const router = useRouter();
  const activate = useAppStore((s) => s.activate);

  const [plan, setPlan] = useState<Plan>(initialPlan);
  // Mỗi gói một đơn, tạo tự động khi khách mở trang/đổi gói — đổi qua lại không sinh thêm đơn.
  const [orders, setOrders] = useState<Partial<Record<Plan, OrderInfo>>>({});
  const [error, setError] = useState<string | null>(null);
  const [paidOrder, setPaidOrder] = useState<OrderInfo | null>(null);
  const [retry, setRetry] = useState(0);
  const requested = useRef<Set<Plan>>(new Set());
  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  const trackedRef = useRef(false);

  const order = orders[plan];
  const paid = paidOrder !== null;

  useEffect(() => {
    if (requested.current.has(plan)) return;
    requested.current.add(plan);
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không tạo được đơn hàng");
        setError(null);
        setOrders((o) => ({ ...o, [plan]: { ...data, plan } }));
      })
      .catch((e) => {
        requested.current.delete(plan);
        setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
      });
  }, [plan, retry]);

  // Khách có thể đã quét mã của gói trước khi đổi gói, nên theo dõi mọi đơn đã tạo.
  useEffect(() => {
    if (paid) return;
    const timer = setInterval(async () => {
      for (const o of Object.values(ordersRef.current)) {
        try {
          const res = await fetch(`/api/orders/${o.refCode}`);
          if (!res.ok) continue;
          if ((await res.json()).status !== "paid") continue;

          const actRes = await fetch("/api/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: o.refCode }),
          });
          const actData = await actRes.json();
          if (actRes.ok) {
            activate(actData.expiresAt);
            setPaidOrder(o);
            return;
          }
        } catch {
          // Bỏ qua lỗi 1 lần poll — vòng lặp sẽ tự thử lại sau 3 giây.
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [paid, activate]);

  useEffect(() => {
    if (!paidOrder || trackedRef.current) return;
    trackedRef.current = true;
    trackPurchase(`cap3_${paidOrder.plan}`, paidOrder.amount);
  }, [paidOrder]);

  if (paidOrder) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Kích hoạt thành công!</h1>
        <p className="mt-2 text-ink-muted">
          Tài khoản đã được nâng cấp gói {PLAN_LABEL[paidOrder.plan]} trên trình duyệt này.
        </p>
        <div className="mt-5 rounded-xl border border-ink/10 bg-paper-card p-4 text-sm">
          <p className="text-ink-muted">Mã kích hoạt của bạn — hãy chụp màn hình hoặc ghi lại để dùng trên thiết bị khác (tối đa 3 thiết bị)</p>
          <p className="mt-2 select-all font-display text-2xl font-bold tracking-widest text-pine-dark">{paidOrder.refCode}</p>
        </div>
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
      <p className="mt-1 text-sm text-ink-muted">Quét mã QR chuyển khoản, tự động kích hoạt trong vài giây — không cần đăng ký.</p>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-paper-card p-6 text-center shadow-sm">
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`relative rounded-xl border p-3 text-center transition ${
                plan === p ? "border-pine bg-pine/10" : "border-ink/10 bg-sand/40"
              }`}
            >
              <div className="text-sm text-ink-muted">{PLAN_LABEL[p]}</div>
              <div className="mt-1 font-semibold text-ink">{PLAN_PRICE_VND[p].toLocaleString("vi-VN")}đ</div>
            </button>
          ))}
        </div>

        {!order ? (
          <div className="py-16 text-sm text-ink-muted">
            {error ? (
              <>
                <p className="text-seal">{error}</p>
                <button
                  onClick={() => setRetry((n) => n + 1)}
                  className="mt-3 rounded-xl border border-pine px-4 py-2 font-semibold text-pine hover:bg-pine/5"
                >
                  Thử lại
                </button>
              </>
            ) : (
              "Đang tạo mã QR..."
            )}
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm text-ink-muted">Quét mã để chuyển khoản đúng số tiền và nội dung</p>
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
            <p className="mt-4 text-xs text-ink-muted">
              Đã chuyển khoản quá 5 phút chưa thấy kích hoạt? Liên hệ Zalo/điện thoại{" "}
              <a href="https://zalo.me/0944851719" target="_blank" rel="noopener noreferrer" className="font-medium text-pine hover:text-pine-dark">
                0944 851719
              </a>{" "}
              kèm mã <span className="font-semibold text-ink">{order.refCode}</span> để được kích hoạt tay.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
