import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { checkTrial, consumeTrial } from "@/lib/trial-guard";
import { addHistoryEntry } from "@/lib/history-store";
import { ai, GEMINI_MODEL } from "@/lib/gemini";
import { LATEX_INSTRUCTION } from "@/lib/prompt-fragments";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    tenBai: { type: Type.STRING },
    monHoc: { type: Type.STRING },
    khoiLop: { type: Type.STRING },
    baiTap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          noiDung: { type: Type.STRING },
          dapAn: { type: Type.STRING },
        },
        required: ["noiDung", "dapAn"],
      },
    },
  },
  required: ["tenBai", "monHoc", "khoiLop", "baiTap"],
};

function buildPrompt(monHoc: string, khoiLop: string, tenBai: string, soBai: number, nguLieu?: string) {
  const nguLieuBlock = nguLieu
    ? `\nDưới đây là ngữ liệu/dạng bài do giáo viên cung cấp — hãy bám sát nội dung, dạng bài trong ngữ liệu này thay vì tự suy diễn:\n"""\n${nguLieu}\n"""\n`
    : "";

  return `Bạn là giáo viên THPT Việt Nam giàu kinh nghiệm ra bài tập luyện tập.

Hãy soạn một phiếu bài tập cho:
- Môn học: ${monHoc}
- Khối lớp: ${khoiLop}
- Chủ đề/bài: ${tenBai}
${nguLieuBlock}- Số lượng bài tập: khoảng ${soBai} bài, độ khó tăng dần từ cơ bản đến nâng cao.
- Mỗi bài phải có "dapAn" chính xác, trình bày ngắn gọn.
- ${LATEX_INSTRUCTION}

Chỉ trả về JSON đúng theo schema đã cho, không thêm markdown, không thêm giải thích.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const trial = await checkTrial(ip, "bai-tap");
  if (!trial.allowed) {
    return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
  }

  const { monHoc, khoiLop, tenBai, soBai, nguLieu } = await req.json();
  if (!monHoc || !khoiLop || !tenBai) {
    return NextResponse.json({ error: "Thiếu môn học, khối lớp hoặc chủ đề" }, { status: 400 });
  }
  if ([monHoc, khoiLop, tenBai].some((v) => typeof v !== "string" || v.length > 200)) {
    return NextResponse.json({ error: "Nội dung nhập vào quá dài" }, { status: 400 });
  }
  if (nguLieu !== undefined && (typeof nguLieu !== "string" || nguLieu.length > 4000)) {
    return NextResponse.json({ error: "Ngữ liệu quá dài" }, { status: 400 });
  }
  const count = Number(soBai) || 8;
  if (count < 1 || count > 30) {
    return NextResponse.json({ error: "Số bài tập phải từ 1 đến 30" }, { status: 400 });
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(monHoc, khoiLop, tenBai, count, nguLieu),
      config: { responseMimeType: "application/json", responseSchema },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini không trả về nội dung");

    await consumeTrial(trial.uid, trial.ip, "bai-tap");
    const result = { ...JSON.parse(text), tenBai, monHoc, khoiLop };
    await addHistoryEntry(trial.uid, "bai-tap", tenBai, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Gemini bai-tap error:", err);
    return NextResponse.json({ error: "Không thể tạo bài tập lúc này, vui lòng thử lại" }, { status: 502 });
  }
}
