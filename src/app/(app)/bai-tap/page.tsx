"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { generateExerciseDocx, docxToBlob } from "@/lib/docx-generator";
import { generateExercisePptx, downloadPptx } from "@/lib/pptx-generator";
import { exerciseToMarkdown } from "@/lib/export-text";
import type { ExercisePlan } from "@/lib/types";
import ActivationModal from "@/components/ActivationModal";
import ResultPanel from "@/components/ResultPanel";
import EmptyResult from "@/components/EmptyResult";
import CharCounter from "@/components/CharCounter";

const KHOI_LOP = ["10", "11", "12"];
const MON_HOC = [
  "Ngữ văn", "Toán", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học",
  "Lịch sử", "Địa lí", "Giáo dục kinh tế và pháp luật", "Tin học",
  "Công nghệ", "Giáo dục thể chất",
];

export default function BaiTapPage() {
  const { trialsLeft, isVip, useTrial, canExport, useExport } = useAppStore();
  const addEntry = useHistoryStore((s) => s.addEntry);
  const [khoiLop, setKhoiLop] = useState(KHOI_LOP[0]);
  const [monHoc, setMonHoc] = useState(MON_HOC[0]);
  const [tenBai, setTenBai] = useState("");
  const [nguLieu, setNguLieu] = useState("");
  const [soBai, setSoBai] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [lastExercise, setLastExercise] = useState<ExercisePlan | null>(null);

  async function handleGenerate() {
    if (!tenBai.trim()) {
      setError("Vui lòng nhập chủ đề bài tập");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bai-tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          khoiLop: `Lớp ${khoiLop}`,
          monHoc,
          tenBai,
          soBai,
          nguLieu: nguLieu.trim() || undefined,
        }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");

      const ex = data as ExercisePlan;
      setLastExercise(ex);
      addEntry("bai-tap", ex.tenBai, ex);
      if (!isVip) useTrial("bai-tap");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocx(ex: ExercisePlan) {
    const doc = generateExerciseDocx(ex);
    const blob = await docxToBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bai-tap-${ex.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExport(run: () => void) {
    if (!isVip && !canExport("bai-tap")) {
      setShowPaywall(true);
      return;
    }
    if (!isVip) useExport("bai-tap");
    run();
  }

  const left = trialsLeft("bai-tap");

  return (
    <main className="px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Tạo Bài Tập</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Sinh phiếu bài tập luyện tập kèm đáp án, độ khó tăng dần, xuất Word ngay.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-paper-card shadow-sm">
          <div className="notebook-ruled absolute inset-0 opacity-40" />
          <div className="absolute inset-y-0 left-10 w-px bg-seal/50" />

          <div className="relative p-6 pl-16">
            <div>
              <label className="text-sm text-ink-muted">Khối lớp</label>
              <select
                value={khoiLop}
                onChange={(e) => setKhoiLop(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
              >
                {KHOI_LOP.map((k) => (
                  <option key={k} value={k}>Lớp {k}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm text-ink-muted">Môn học</label>
              <select
                value={monHoc}
                onChange={(e) => setMonHoc(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
              >
                {MON_HOC.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm text-ink-muted">Chủ đề bài tập</label>
              <input
                value={tenBai}
                onChange={(e) => setTenBai(e.target.value)}
                maxLength={200}
                placeholder="Ví dụ: Phương trình bậc hai"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm text-ink-muted">
                Ngữ liệu / dạng bài tham khảo <span className="text-ink-muted/60">(tuỳ chọn)</span>
              </label>
              <textarea
                value={nguLieu}
                onChange={(e) => setNguLieu(e.target.value.slice(0, 4000))}
                maxLength={4000}
                rows={3}
                placeholder="Dán nội dung/dạng bài tham khảo để AI bám sát hơn..."
                className="mt-1 w-full resize-none rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
              <CharCounter length={nguLieu.length} max={4000} />
            </div>

            <div className="mt-4">
              <label className="text-sm text-ink-muted">Số lượng bài tập</label>
              <input
                type="number"
                min={1}
                max={30}
                value={soBai}
                onChange={(e) => setSoBai(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
              />
            </div>

            {error && <p className="mt-3 text-sm text-seal">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-pine py-3 font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-50"
            >
              {loading ? "Đang tạo bài tập..." : "Tạo bài tập"}
            </button>

            <p className="mt-3 text-center text-xs text-ink-muted" suppressHydrationWarning>
              {isVip ? "Tài khoản VIP — dùng không giới hạn" : `Còn ${left}/3 lượt dùng thử miễn phí cho mục này`}
            </p>
          </div>
        </div>

        {lastExercise ? (
          <ResultPanel
            title="Chi Tiết Phiếu Bài Tập"
            markdown={exerciseToMarkdown(lastExercise)}
            onDownloadDocx={() => handleExport(() => downloadDocx(lastExercise))}
            onDownloadPptx={() =>
              handleExport(() =>
                downloadPptx(generateExercisePptx(lastExercise), `Bai-tap-${lastExercise.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}`)
              )
            }
            locked={!isVip && !canExport("bai-tap")}
          />
        ) : (
          <EmptyResult text="Điền thông tin bên trái và bấm Tạo bài tập để xem kết quả tại đây." />
        )}
      </div>

      {showPaywall && <ActivationModal onClose={() => setShowPaywall(false)} />}
    </main>
  );
}
