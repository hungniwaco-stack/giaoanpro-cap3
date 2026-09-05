"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { generateLessonPlanDocx, docxToBlob } from "@/lib/docx-generator";
import { generateLessonPlanPptx, downloadPptx } from "@/lib/pptx-generator";
import { lessonPlanToMarkdown } from "@/lib/export-text";
import type { LessonPlan } from "@/lib/types";
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

export default function GiaoAnPage() {
  const { trialsLeft, isVip, useTrial, canExport, useExport } = useAppStore();
  const addEntry = useHistoryStore((s) => s.addEntry);
  const [khoiLop, setKhoiLop] = useState(KHOI_LOP[0]);
  const [monHoc, setMonHoc] = useState(MON_HOC[0]);
  const [tenBai, setTenBai] = useState("");
  const [trichDoanSgk, setTrichDoanSgk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [lastPlan, setLastPlan] = useState<LessonPlan | null>(null);

  async function handleGenerate() {
    if (!tenBai.trim()) {
      setError("Vui lòng nhập tên bài học");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          khoiLop: `Lớp ${khoiLop}`,
          monHoc,
          tenBai,
          trichDoanSgk: trichDoanSgk.trim() || undefined,
        }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");

      const plan = data as LessonPlan;
      setLastPlan(plan);
      addEntry("giao-an", plan.tenBai, plan);
      if (!isVip) useTrial("generate");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocx(plan: LessonPlan) {
    const doc = generateLessonPlanDocx(plan);
    const blob = await docxToBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Giao-an-${plan.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Xem preview không giới hạn theo lượt tạo — chỉ chặn ở đúng lúc xuất file,
  // đúng lúc giáo viên đã thấy giá trị và muốn mang ra khỏi màn hình.
  function handleExport(run: () => void) {
    if (!isVip && !canExport("generate")) {
      setShowPaywall(true);
      return;
    }
    if (!isVip) useExport("generate");
    run();
  }

  const left = trialsLeft("generate");

  return (
    <main className="px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Soạn Giáo Án Chi Tiết</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Chọn lớp, môn, tên bài — AI soạn giáo án đúng khung Công văn 5512, xuất Word ngay.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,720px)]">
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
              <label className="text-sm text-ink-muted">Tên bài học</label>
              <input
                value={tenBai}
                onChange={(e) => setTenBai(e.target.value)}
                maxLength={200}
                placeholder="Ví dụ: Dao động điều hòa"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm text-ink-muted">
                Trích đoạn SGK <span className="text-ink-muted/60">(tuỳ chọn)</span>
              </label>
              <textarea
                value={trichDoanSgk}
                onChange={(e) => setTrichDoanSgk(e.target.value.slice(0, 4000))}
                maxLength={4000}
                rows={3}
                placeholder="Dán nội dung bài học từ SGK để AI bám sát hơn..."
                className="mt-1 w-full resize-none rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
              <CharCounter length={trichDoanSgk.length} max={4000} />
            </div>

            {error && <p className="mt-3 text-sm text-seal">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-pine py-3 font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-50"
            >
              {loading ? "Đang soạn giáo án..." : "Soạn giáo án"}
            </button>

            <p className="mt-3 text-center text-xs text-ink-muted" suppressHydrationWarning>
              {isVip ? "Tài khoản VIP — dùng không giới hạn" : `Còn ${left}/3 lượt dùng thử miễn phí cho mục này`}
            </p>
          </div>
        </div>

        {lastPlan ? (
          <ResultPanel
            title="Chi Tiết Giáo Án"
            markdown={lessonPlanToMarkdown(lastPlan)}
            onDownloadDocx={() => handleExport(() => downloadDocx(lastPlan))}
            onDownloadPptx={() =>
              handleExport(() =>
                downloadPptx(generateLessonPlanPptx(lastPlan), `Giao-an-${lastPlan.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}`)
              )
            }
            locked={!isVip && !canExport("generate")}
          />
        ) : (
          <EmptyResult text="Điền thông tin bên trái và bấm Soạn giáo án để xem kết quả tại đây." />
        )}
      </div>

      {showPaywall && <ActivationModal onClose={() => setShowPaywall(false)} />}
    </main>
  );
}
