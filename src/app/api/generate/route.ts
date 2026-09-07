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
    thoiLuong: { type: Type.STRING },
    mucTieuKienThuc: { type: Type.ARRAY, items: { type: Type.STRING } },
    mucTieuNangLuc: { type: Type.ARRAY, items: { type: Type.STRING } },
    mucTieuPhamChat: { type: Type.ARRAY, items: { type: Type.STRING } },
    thietBiDayHoc: { type: Type.ARRAY, items: { type: Type.STRING } },
    hoatDong: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ten: { type: Type.STRING },
          mucTieu: { type: Type.STRING },
          noiDung: { type: Type.STRING },
          sanPham: { type: Type.STRING },
          toChucThucHien: { type: Type.STRING },
        },
        required: ["ten", "mucTieu", "noiDung", "sanPham", "toChucThucHien"],
      },
    },
  },
  required: [
    "tenBai", "monHoc", "khoiLop", "thoiLuong",
    "mucTieuKienThuc", "mucTieuNangLuc", "mucTieuPhamChat",
    "thietBiDayHoc", "hoatDong",
  ],
};

function buildPrompt(monHoc: string, khoiLop: string, tenBai: string, trichDoanSgk?: string) {
  const sgkBlock = trichDoanSgk
    ? `\nDưới đây là trích đoạn gốc từ sách giáo khoa cho đúng bài này — hãy bám sát nội dung, ví dụ, số liệu trong trích đoạn này thay vì tự suy diễn:\n"""\n${trichDoanSgk}\n"""\n`
    : "";

  return `Bạn là một chuyên gia sư phạm THPT Việt Nam, dày dạn kinh nghiệm soạn giáo án theo Công văn 5512/BGDĐT-GDTrH, bám sát chương trình GDPT 2018 và bộ sách "Kết nối tri thức với cuộc sống".

Hãy soạn một giáo án chi tiết cho:
- Môn học: ${monHoc}
- Khối lớp: ${khoiLop}
- Tên bài: ${tenBai}
${sgkBlock}
Yêu cầu về nội dung:
- Mục tiêu bài học chia rõ 3 nhóm: Kiến thức, Năng lực, Phẩm chất (mỗi nhóm 2-4 gạch đầu dòng, cụ thể, đo lường được).
- Thiết bị dạy học và học liệu: liệt kê ngắn gọn, thực tế (SGK, máy chiếu, phiếu học tập, v.v.).
- Tiến trình dạy học gồm đúng 4 hoạt động theo khung 5512: "Hoạt động 1: Mở đầu", "Hoạt động 2: Hình thành kiến thức mới", "Hoạt động 3: Luyện tập", "Hoạt động 4: Vận dụng". Mỗi hoạt động phải có đủ 4 phần: Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện — viết súc tích, đúng chuyên môn, có thể dùng ngay trên lớp.
- ${LATEX_INSTRUCTION}

Chỉ trả về JSON đúng theo schema đã cho, không thêm markdown, không thêm giải thích.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const trial = await checkTrial(ip, "generate");
  if (!trial.allowed) {
    return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
  }

  const { monHoc, khoiLop, tenBai, trichDoanSgk } = await req.json();
  if (!monHoc || !khoiLop || !tenBai) {
    return NextResponse.json({ error: "Thiếu môn học, khối lớp hoặc tên bài" }, { status: 400 });
  }
  if ([monHoc, khoiLop, tenBai].some((v) => typeof v !== "string" || v.length > 200)) {
    return NextResponse.json({ error: "Nội dung nhập vào quá dài" }, { status: 400 });
  }
  if (trichDoanSgk !== undefined && (typeof trichDoanSgk !== "string" || trichDoanSgk.length > 4000)) {
    return NextResponse.json({ error: "Trích đoạn SGK quá dài" }, { status: 400 });
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(monHoc, khoiLop, tenBai, trichDoanSgk),
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini không trả về nội dung");

    // Trust our own inputs over whatever the model echoed back in the JSON —
    // it sometimes "corrects" these to match its own reading of the topic.
    const result = { ...JSON.parse(text), tenBai, monHoc, khoiLop };
    // Chỉ tiêu lượt dùng thử SAU khi chắc chắn có kết quả hợp lệ — JSON lỗi
    // định dạng (Gemini bị cắt giữa chừng) không được phép trừ lượt của khách.
    await consumeTrial(trial.uid, trial.ip, "generate");
    try {
      await addHistoryEntry(trial.uid, "giao-an", tenBai, result);
    } catch (err) {
      console.error("Lưu lịch sử thất bại:", err);
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Gemini generate error:", err);
    return NextResponse.json({ error: "Không thể tạo giáo án lúc này, vui lòng thử lại" }, { status: 502 });
  }
}
