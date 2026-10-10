import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { FEEDBACK_OPTIONS, FEEDBACK_TEXT_MAX } from "@/lib/feedback";

// ponytail: không giới hạn tần suất theo IP — danh sách cắt còn 1000 mục nên spam
// không làm phình Redis; thêm giới hạn nếu thấy bị lạm dụng.
const LIST_MAX = 1000;

export async function POST(req: NextRequest) {
  let body: { option?: unknown; text?: unknown; ctx?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const option = FEEDBACK_OPTIONS.find((o) => o.id === body.option)?.id;
  if (!option) return NextResponse.json({ error: "Lựa chọn không hợp lệ" }, { status: 400 });

  const entry = {
    option,
    text: typeof body.text === "string" ? body.text.trim().slice(0, FEEDBACK_TEXT_MAX) : "",
    ctx: typeof body.ctx === "string" ? body.ctx.slice(0, 80) : "",
    at: Date.now(),
  };

  try {
    await redis.lpush("feedback:list", entry);
    await redis.ltrim("feedback:list", 0, LIST_MAX - 1);
    await redis.hincrby("feedback:counts", option, 1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lưu phản hồi thất bại:", err);
    return NextResponse.json({ error: "Không gửi được phản hồi lúc này." }, { status: 500 });
  }
}
