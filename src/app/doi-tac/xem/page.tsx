"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Stats {
  code: string;
  name: string;
  bankName: string;
  accountNumber: string;
  earned: number;
  paid: number;
  balance: number;
  orders: number;
  customers: number;
  recent: { orderRef: string; plan: string; amount: number; commission: number; customer: string; at: number }[];
}

const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-paper-card p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function Dashboard() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const token = params.get("t") ?? "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/affiliate/stats?code=${encodeURIComponent(code)}&t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Không tải được số liệu");
        setStats(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Không tải được số liệu"));
  }, [code, token]);

  if (error) return <p className="text-seal">{error}</p>;
  if (!stats) return <p className="text-ink-muted">Đang tải...</p>;

  const link = `${window.location.origin}/?ref=${stats.code}`;

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-ink">Xin chào {stats.name}</h1>
      <div className="mt-4 rounded-2xl border border-ink/10 bg-paper-card p-5">
        <p className="text-sm text-ink-muted">Link giới thiệu của bạn</p>
        <p className="mt-1 break-all font-medium text-pine-dark">{link}</p>
        <button
          onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
          className="mt-3 rounded-lg border border-pine px-3 py-1.5 text-sm font-medium text-pine hover:bg-pine/5"
        >
          {copied ? "Đã sao chép" : "Sao chép link"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Số dư chờ chi" value={vnd(stats.balance)} />
        <Card label="Tổng hoa hồng" value={vnd(stats.earned)} />
        <Card label="Đã chi trả" value={vnd(stats.paid)} />
        <Card label="Khách / đơn" value={`${stats.customers} / ${stats.orders}`} />
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Chi trả về: {stats.bankName} — {stats.accountNumber}
      </p>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Hoa hồng gần đây</h2>
      {stats.recent.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">Chưa có đơn nào. Chia sẻ link giới thiệu để bắt đầu.</p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-paper-card text-sm">
          {stats.recent.map((c, i) => (
            <div key={c.orderRef} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-ink/10" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-ink">{c.customer}</p>
                <p className="text-xs text-ink-muted">
                  {new Date(c.at).toLocaleString("vi-VN")} — đơn {vnd(c.amount)}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-pine-dark">+{vnd(c.commission)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function AffiliateDashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Suspense fallback={<p className="text-ink-muted">Đang tải...</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
