import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { checkTrial, consumeTrial } from "@/lib/trial-guard";
import { ai } from "@/lib/gemini";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    tenBai: { type: Type.STRING },
    monHoc: { type: Type.STRING },
    khoiLop: { type: Type.STRING },
    thoiGianLamBai: { type: Type.STRING },
    cauHoi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          loai: { type: Type.STRING, enum: ["trac_nghiem", "tu_luan"] },
          noiDung: { type: Type.STRING },
          luaChon: { type: Type.ARRAY, items: { type: Type.STRING } },
          dapAn: { type: Type.STRING },
        },
        required: ["loai", "noiDung", "dapAn"],
      },
    },
  },
  required: ["tenBai", "monHoc", "khoiLop", "thoiGianLamBai", "cauHoi"],
};

function buildPrompt(monHoc: string, khoiLop: string, tenBai: string, soCauhoi: number) {
  return `Bạn là chuyên gia ra đề kiểm tra THPT Việt Nam, bám sát chương trình GDPT 2018.

Hãy soạn một đề kiểm tra cho:
- Môn học: ${monHoc}
- Khối lớp: ${khoiLop}
- Chủ đề/bài: ${tenBai}
- Số câu hỏi: khoảng ${soCauhoi} câu, trộn cả trắc nghiệm (loại "trac_nghiem", có 4 lựa chọn A/B/C/D trong "luaChon") và tự luận (loại "tu_luan", không cần "luaChon").
- Mỗi câu đều phải có "dapAn" chính xác, súc tích.
- Độ khó tăng dần, phù hợp trình độ học sinh khối lớp trên.

Chỉ trả về JSON đúng theo schema đã cho, không thêm markdown, không thêm giải thích.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const trial = await checkTrial(ip, "de-thi");
  if (!trial.allowed) {
    return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
  }

  const { monHoc, khoiLop, tenBai, soCauhoi } = await req.json();
  if (!monHoc || !khoiLop || !tenBai) {
    return NextResponse.json({ error: "Thiếu môn học, khối lớp hoặc chủ đề" }, { status: 400 });
  }
  if ([monHoc, khoiLop, tenBai].some((v) => typeof v !== "string" || v.length > 200)) {
    return NextResponse.json({ error: "Nội dung nhập vào quá dài" }, { status: 400 });
  }
  const count = Number(soCauhoi) || 10;
  if (count < 1 || count > 30) {
    return NextResponse.json({ error: "Số câu hỏi phải từ 1 đến 30" }, { status: 400 });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(monHoc, khoiLop, tenBai, count),
      config: { responseMimeType: "application/json", responseSchema },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini không trả về nội dung");

    await consumeTrial(trial.uid, trial.ip, "de-thi");
    return NextResponse.json({ ...JSON.parse(text), tenBai, monHoc, khoiLop });
  } catch (err) {
    console.error("Gemini de-thi error:", err);
    return NextResponse.json({ error: "Không thể tạo đề kiểm tra lúc này, vui lòng thử lại" }, { status: 502 });
  }
}
