import { ai, GEMINI_MODEL } from "./gemini";

// Gemini là nguồn chính. Nếu Gemini không dùng được (hết hạn mức, khoá sai/bị khoá, lỗi mạng,
// trả về rỗng hoặc JSON hỏng) và có DEEPSEEK_API_KEY thì tự chuyển sang DeepSeek.
// Đổi model/địa chỉ DeepSeek bằng biến môi trường, không cần sửa từng route.
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-flash";
const DEEPSEEK_TIMEOUT_MS = 90_000;

export interface AiMessage {
  role: "user" | "model";
  content: string;
}

export interface AskRequest {
  system?: string;
  messages: AiMessage[];
  // Schema kiểu Gemini. Có schema = chế độ JSON: Gemini ép theo schema, DeepSeek được mô tả schema trong prompt.
  responseSchema?: object;
  // Nội dung nhiều dạng (ảnh/PDF) — chỉ Gemini đọc được, DeepSeek dùng `messages`.
  geminiContents?: unknown;
  // false = không dự phòng bằng DeepSeek (ví dụ tài liệu DeepSeek không đọc được).
  deepseekOk?: boolean;
}

export function aiConfigured() {
  return !!process.env.GEMINI_API_KEY || !!process.env.DEEPSEEK_API_KEY;
}

async function askGemini(req: AskRequest): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: (req.geminiContents ??
      req.messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }))) as never,
    config: {
      ...(req.system ? { systemInstruction: req.system } : {}),
      ...(req.responseSchema
        ? { responseMimeType: "application/json", responseSchema: req.responseSchema as never }
        : {}),
    },
  });
  const text = response.text;
  if (!text) throw new Error("Gemini không trả về nội dung");
  return text;
}

async function askDeepseek(req: AskRequest): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("Chưa cấu hình DEEPSEEK_API_KEY");

  // Chế độ JSON của DeepSeek đòi lời nhắc có chữ "json" kèm mô tả định dạng mong muốn.
  const system = [
    req.system,
    req.responseSchema &&
      `Chỉ trả về DUY NHẤT một đối tượng JSON (json) hợp lệ theo schema sau, không markdown, không giải thích:\n${JSON.stringify(req.responseSchema)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...req.messages.map((m) => ({ role: m.role === "model" ? "assistant" : "user", content: m.content })),
      ],
      ...(req.responseSchema ? { response_format: { type: "json_object" } } : {}),
      // Chế độ suy luận mặc định bật: chậm và tốn hơn, không cần cho soạn giáo án.
      thinking: { type: "disabled" },
      max_tokens: 8000,
      stream: false,
    }),
    signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = (await res.json())?.choices?.[0]?.message?.content;
  if (!text) throw new Error("DeepSeek không trả về nội dung");
  return text;
}

// Trả về chuỗi văn bản (hoặc chuỗi JSON đã kiểm tra parse được khi có responseSchema).
// Lỗi ở đây = cả hai nguồn đều hỏng, route gọi phải trả 502 và KHÔNG trừ lượt dùng thử.
export async function askAI(req: AskRequest): Promise<string> {
  const canFallback = !!process.env.DEEPSEEK_API_KEY && req.deepseekOk !== false;

  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await askGemini(req);
      if (req.responseSchema) JSON.parse(text);
      return text;
    } catch (err) {
      if (!canFallback) throw err;
      console.error("Gemini lỗi — chuyển sang DeepSeek dự phòng:", err);
    }
  } else if (!canFallback) {
    throw new Error("Chưa cấu hình GEMINI_API_KEY hoặc DEEPSEEK_API_KEY");
  }

  const text = await askDeepseek(req);
  if (req.responseSchema) JSON.parse(text);
  return text;
}
