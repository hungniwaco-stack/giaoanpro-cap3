"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { generateExamDocx, docxToBlob } from "@/lib/docx-generator";
import { generateExamPptx, downloadPptx } from "@/lib/pptx-generator";
import { examToMarkdown } from "@/lib/export-text";
import type { ExamPlan } from "@/lib/types";
import ActivationModal from "@/components/ActivationModal";
import ResultPanel from "@/components/ResultPanel";
import EmptyResult from "@/components/EmptyResult";

const KHOI_LOP = ["10", "11", "12"];
const MON_HOC = [
  "Ngữ văn", "Toán", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học",
  "Lịch sử", "Địa lí", "Giáo dục kinh tế và pháp luật", "Tin học",
  "Công nghệ", "Giáo dục thể chất",
];

export default function DeThiPage() {
  const { trialsLeft, isVip, useTrial } = useAppStore();
  const addEntry = useHistoryStore((s) => s.addEntry);
  const [khoiLop, setKhoiLop] = useState(KHOI_LOP[0]);
  const [monHoc, setMonHoc] = useState(MON_HOC[0]);
  const [tenBai, setTenBai] = useState("");
  const [thoiGianLamBai, setThoiGianLamBai] = useState("45 phút");
  const [soCauhoi, setSoCauhoi] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [lastExam, setLastExam] = useState<ExamPlan | null>(null);

  async function handleGenerate() {
    if (!tenBai.trim()) {
      setError("Vui lòng nhập chủ đề / bài kiểm tra");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/de-thi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ khoiLop: `Lớp ${khoiLop}`, monHoc, tenBai, soCauhoi }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");

      const exam = { ...data, thoiGianLamBai } as ExamPlan;
      setLastExam(exam);
      addEntry("de-thi", exam.tenBai, exam);
      if (!isVip) useTrial();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocx(exam: ExamPlan) {
    const doc = generateExamDocx(exam);
    const blob = await docxToBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `De-kiem-tra-${exam.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const left = trialsLeft();

  return (
    <main className="px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Thiết Kế Đề Thi</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Ra đề kiểm tra trộn trắc nghiệm + tự luận, kèm đáp án, xuất Word ngay.
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
              <label className="text-sm text-ink-muted">Chủ đề / phạm vi kiểm tra</label>
              <input
                value={tenBai}
                onChange={(e) => setTenBai(e.target.value)}
                maxLength={200}
                placeholder="Ví dụ: Chương 2 - Dao động cơ"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-ink-muted">Thời gian làm bài</label>
                <input
                  value={thoiGianLamBai}
                  onChange={(e) => setThoiGianLamBai(e.target.value)}
                  maxLength={30}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
                />
              </div>
              <div>
                <label className="text-sm text-ink-muted">Số câu hỏi</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={soCauhoi}
                  onChange={(e) => setSoCauhoi(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-seal">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-pine py-3 font-semibold text-paper transition hover:bg-pine-dark disabled:opacity-50"
            >
              {loading ? "Đang ra đề..." : "Tạo đề kiểm tra"}
            </button>

            <p className="mt-3 text-center text-xs text-ink-muted" suppressHydrationWarning>
              {isVip ? "Tài khoản VIP — dùng không giới hạn" : `Còn ${left} lượt dùng thử miễn phí`}
            </p>
          </div>
        </div>

        {lastExam ? (
          <ResultPanel
            title="Chi Tiết Đề Kiểm Tra"
            markdown={examToMarkdown(lastExam)}
            onDownloadDocx={() => downloadDocx(lastExam)}
            onDownloadPptx={() => downloadPptx(generateExamPptx(lastExam), `De-kiem-tra-${lastExam.tenBai.replace(/[^\p{L}\p{N}]+/gu, "-")}`)}
          />
        ) : (
          <EmptyResult text="Điền thông tin bên trái và bấm Tạo đề kiểm tra để xem kết quả tại đây." />
        )}
      </div>

      {showPaywall && <ActivationModal onClose={() => setShowPaywall(false)} />}
    </main>
  );
}
