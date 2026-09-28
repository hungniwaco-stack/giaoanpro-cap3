"use client";

import { useState } from "react";

interface Row {
  code: string;
  name: string;
  email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  earned: number;
  paid: number;
  balance: number;
  orders: number;
  dashboardPath: string;
}

const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export default function AffiliateAdminPage() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(init?: RequestInit) {
    const res = await fetch("/api/affiliate/admin", {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");
    return data;
  }

  async function load() {
    setError(null);
    try {
      setRows((await call()).affiliates);
    } catch (e) {
      setRows(null);
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    }
  }

  async function markPaid(r: Row) {
    if (!window.confirm(`Xác nhận ĐÃ CHUYỂN ${vnd(r.balance)} cho ${r.name} (${r.bankName} ${r.accountNumber})?`)) return;
    setError(null);
    try {
      await call({ method: "POST", body: JSON.stringify({ code: r.code, amount: r.balance }) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    }
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">Quản trị cộng tác viên</h1>
      <div className="mt-4 flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Khoá quản trị"
          className="w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
        />
        <button onClick={load} className="rounded-lg bg-pine px-4 py-2 font-medium text-paper hover:bg-pine-dark">
          Xem danh sách
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-seal">{error}</p>}

      {rows && (
        <div className="mt-6 space-y-3">
          {rows.length === 0 && <p className="text-sm text-ink-muted">Chưa có cộng tác viên nào.</p>}
          {rows.map((r) => (
            <div key={r.code} className="rounded-xl border border-ink/10 bg-paper-card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {r.name} <span className="font-normal text-ink-muted">({r.code})</span>
                  </p>
                  <p className="text-ink-muted">{r.email}</p>
                  <p className="mt-1 text-ink">
                    {r.bankName} — {r.accountNumber} — {r.accountName}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}${r.dashboardPath}`)}
                    className="mt-1 text-xs font-medium text-pine hover:underline"
                  >
                    Sao chép link xem số liệu của CTV (gửi tay nếu email không tới)
                  </button>
                  <p className="mt-1 text-xs text-ink-muted">
                    {r.orders} đơn · tổng {vnd(r.earned)} · đã chi {vnd(r.paid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-muted">Cần chi</p>
                  <p className="text-lg font-semibold text-pine-dark">{vnd(r.balance)}</p>
                  {r.balance > 0 && (
                    <button onClick={() => markPaid(r)} className="mt-2 rounded-lg border border-pine px-3 py-1.5 text-xs font-medium text-pine hover:bg-pine/5">
                      Đã chuyển khoản
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
