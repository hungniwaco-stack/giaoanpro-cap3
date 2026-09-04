import { NextRequest, NextResponse } from "next/server";
import { checkTrial, consumeTrial } from "@/lib/trial-guard";
import { ai } from "@/lib/gemini";

const SYSTEM_INSTRUCTION =
  "Bạn là trợ lý AI dành cho giáo viên THPT Việt Nam. Trả lời ngắn gọn, đúng chuyên môn sư phạm, bằng tiếng Việt. Có thể gợi ý hoạt động dạy học, giải thích khái niệm, hoặc góp ý cải thiện nội dung giáo viên đưa ra. Trả lời bằng văn bản thuần tuý, KHÔNG dùng cú pháp markdown (không **in đậm**, không #tiêu đề) — chỉ dùng gạch đầu dòng '-' hoặc số thứ tự khi cần liệt kê.";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LEN = 2000;

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Server chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const trial = await checkTrial(ip, "chat");
  if (!trial.allowed) {
    return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Nội dung trò chuyện không hợp lệ" }, { status: 400 });
  }
  for (const m of messages) {
    if (
      typeof m.content !== "string" ||
      m.content.length > MAX_MESSAGE_LEN ||
      (m.role !== "user" && m.role !== "model")
    ) {
      return NextResponse.json({ error: "Nội dung trò chuyện không hợp lệ" }, { status: 400 });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: messages.map((m: { role: "user" | "model"; content: string }) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini không trả về nội dung");

    await consumeTrial(trial.uid, trial.ip, "chat");
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json({ error: "Không thể trả lời lúc này, vui lòng thử lại" }, { status: 502 });
  }
}
