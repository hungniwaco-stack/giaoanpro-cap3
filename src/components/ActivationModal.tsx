"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { PLAN_LABEL, PLAN_PRICE_VND, type Plan } from "@/lib/plans";

const PLAN_IDS: Plan[] = ["1M", "6M", "1Y"];
const HIGHLIGHT_PLAN: Plan = "6M";

const ZALO_LINK = "https://zalo.me/0944851719";

export default function ActivationModal({ onClose }: { onClose: () => void }) {
  const activate = useAppStore((s) => s.activate);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kích hoạt thất bại");
      activate(data.expiresAt);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="w-full max-w-lg rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-2xl"
        >
          <h2 className="font-display text-xl font-semibold text-ink">Bạn đã dùng hết lượt dùng thử</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Kích hoạt để soạn giáo án không giới hạn, xuất file Word chuẩn 5512.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {PLAN_IDS.map((id) => (
              <div
                key={id}
                className={`rounded-xl border p-3 text-center ${
                  id === HIGHLIGHT_PLAN
                    ? "border-pine bg-pine/10"
                    : "border-ink/10 bg-sand/50"
                }`}
              >
                {id === HIGHLIGHT_PLAN && (
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-pine-dark">
                    Bán chạy
                  </div>
                )}
                <div className="text-sm text-ink-muted">{PLAN_LABEL[id]}</div>
                <div className="mt-1 font-semibold text-ink">{PLAN_PRICE_VND[id].toLocaleString("vi-VN")}đ</div>
              </div>
            ))}
          </div>

          <Link
            href="/nang-cap"
            onClick={onClose}
            className="mt-4 block w-full rounded-xl bg-pine py-2.5 text-center font-medium text-paper transition hover:bg-pine-dark"
          >
            Thanh toán tự động qua VietQR →
          </Link>
          <a
            href={ZALO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full rounded-xl border border-ink/10 py-2 text-center text-sm text-ink-muted transition hover:bg-sand"
          >
            Hoặc nhắn Zalo nếu cần hỗ trợ
          </a>

          <div className="mt-5 border-t border-ink/10 pt-4">
            <label className="text-sm text-ink-muted">Đã có mã kích hoạt?</label>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã kích hoạt"
                className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
              <button
                onClick={handleActivate}
                disabled={loading || !code}
                className="rounded-lg bg-sand px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-ink/10 disabled:opacity-40"
              >
                {loading ? "..." : "Kích hoạt"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-seal">{error}</p>}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full text-center text-sm text-ink-muted hover:text-ink"
          >
            Đóng
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
