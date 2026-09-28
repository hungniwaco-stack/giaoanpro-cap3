import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import mammoth from "mammoth";
import { checkTrial, consumeTrial } from "@/lib/trial-guard";
import { askAI, aiConfigured } from "@/lib/ai";
import { MAU_LIMITS } from "@/lib/mau-truong";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"];
const MAX_DOCX_CHARS = 30000;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    canCu: { type: Type.STRING },
    huongDan: { type: Type.STRING },
  },
  required: ["canCu", "huongDan"],
};

const PROMPT = `Bạn được đưa một tài liệu do Sở GD&ĐT, Phòng GD&ĐT hoặc nhà trường ban hành, hoặc một mẫu Kế hoạch bài dạy (giáo án). Hãy đọc kỹ và rút ra "hướng dẫn soạn giáo án" ngắn gọn để một AI khác dùng soạn giáo án đúng thực tế địa phương. Chỉ dựa vào nội dung tài liệu, không tự bịa thêm.

Trả về JSON:
- "canCu": một dòng ngắn nêu số hiệu/tên văn bản, cơ quan ban hành, ngày ban hành và phụ lục áp dụng (chuỗi rỗng nếu tài liệu không nêu).
- "huongDan": tối đa khoảng 350 từ, dạng gạch đầu dòng, gồm: các mục bắt buộc của giáo án và thứ tự; yêu cầu về hoạt động, phương pháp, hình thức tổ chức; quy định trình bày (tiêu đề, số tiết, ngày soạn, chữ ký duyệt...); lưu ý đặc thù của địa phương. Nếu tài liệu không liên quan đến việc soạn giáo án, để chuỗi rỗng.`;

function detectKind(file: File): "docx" | "pdf" | "image" | null {
  const name = file.name.toLowerCase();
  if (file.type === DOCX_MIME || name.endsWith(".docx")) return "docx";
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (IMAGE_MIMES.includes(file.type)) return "image";
  return null;
}

export async function POST(req: NextRequest) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "Server chưa cấu hình GEMINI_API_KEY hoặc DEEPSEEK_API_KEY" }, { status: 500 });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const trial = await checkTrial(ip, "phan-tich");
    if (!trial.allowed) {
      return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
    }

    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
    }
    if (file.size > MAU_LIMITS.fileBytes) {
      return NextResponse.json({ error: "File quá 4MB — hãy nén file hoặc chỉ giữ các trang cần thiết" }, { status: 400 });
    }
    if (file.name.toLowerCase().endsWith(".doc")) {
      return NextResponse.json({ error: "Chưa hỗ trợ file .doc cũ — hãy lưu lại thành .docx hoặc PDF" }, { status: 400 });
    }
    const kind = detectKind(file);
    if (!kind) {
      return NextResponse.json({ error: "Chỉ nhận file Word (.docx), PDF hoặc ảnh (PNG, JPG, WebP)" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let filePart;
    let docText: string | null = null;
    if (kind === "docx") {
      const text = (await mammoth.extractRawText({ buffer: buf })).value.trim();
      if (text.length < 50) {
        return NextResponse.json({ error: "Không đọc được nội dung trong file Word này" }, { status: 422 });
      }
      docText = `Nội dung tài liệu:\n${text.slice(0, MAX_DOCX_CHARS)}`;
      filePart = { text: docText };
    } else {
      const mimeType = kind === "pdf" ? "application/pdf" : file.type;
      filePart = { inlineData: { mimeType, data: buf.toString("base64") } };
    }

    // DeepSeek chỉ đọc được văn bản: PDF/ảnh không dự phòng được, chỉ file Word.
    const text = await askAI({
      geminiContents: [{ role: "user", parts: [{ text: PROMPT }, filePart] }],
      messages: docText ? [{ role: "user", content: `${PROMPT}

${docText}` }] : [],
      responseSchema,
      deepseekOk: docText !== null,
    });

    const parsed = JSON.parse(text) as { canCu?: string; huongDan?: string };
    const huongDan = (parsed.huongDan ?? "").trim().slice(0, MAU_LIMITS.phanTich);
    if (!huongDan) {
      return NextResponse.json({ error: "Tài liệu này không có nội dung hướng dẫn soạn giáo án" }, { status: 422 });
    }

    // Chỉ tiêu lượt SAU khi có kết quả dùng được, cùng nguyên tắc với route soạn giáo án.
    await consumeTrial(trial.uid, trial.ip, "phan-tich");
    return NextResponse.json({ canCu: (parsed.canCu ?? "").trim().slice(0, MAU_LIMITS.canCu), huongDan });
  } catch (err) {
    console.error("Phân tích tài liệu mẫu thất bại:", err);
    return NextResponse.json({ error: "Không phân tích được tài liệu lúc này, vui lòng thử lại" }, { status: 502 });
  }
}
