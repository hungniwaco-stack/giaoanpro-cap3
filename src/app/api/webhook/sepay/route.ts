import { NextRequest, NextResponse } from "next/server";
import { extractRefCode, getOrder, markOrderPaid } from "@/lib/orders";
import { redis } from "@/lib/redis";
import { activateUid, tryRedeemCode } from "@/lib/trial-guard";
import { sendActivationEmail } from "@/lib/email";
import { PLAN_DAYS } from "@/lib/plans";

// SePay gọi endpoint này mỗi khi phát hiện giao dịch trên tài khoản ngân hàng
// đã liên kết. Xác thực bằng header Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>
// — đúng scheme "Apikey" SePay dùng (không phải "Bearer"), theo cấu hình
// phương thức "API Key" trong dashboard SePay khi khai báo webhook.
export async function POST(req: NextRequest) {
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY;
  const auth = req.headers.get("authorization");
  if (!expectedKey || auth !== `Apikey ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Chỉ xử lý giao dịch tiền vào, bỏ qua tiền ra.
  if (body.transferType && body.transferType !== "in") {
    return NextResponse.json({ ok: true });
  }

  const content: string = body.content ?? body.description ?? "";
  const amount: number = Number(body.transferAmount) || 0;

  const refCode = extractRefCode(content);
  if (!refCode) return NextResponse.json({ ok: true });

  const order = await getOrder(refCode);
  if (!order || order.status === "paid") return NextResponse.json({ ok: true });

  if (amount < order.amount) {
    console.error(`SePay webhook: đơn ${refCode} nhận thiếu tiền (${amount}/${order.amount}) — cần xử lý tay`);
    return NextResponse.json({ ok: true });
  }

  await redis.set(`issued_code:${order.refCode}`, { plan: order.plan });
  await tryRedeemCode(order.refCode, order.uid);
  await activateUid(order.uid, Date.now() + PLAN_DAYS[order.plan] * 24 * 60 * 60 * 1000);
  await markOrderPaid(order.refCode);

  try {
    await sendActivationEmail(order.email, order.refCode, order.plan);
  } catch (err) {
    console.error("Gửi email kích hoạt thất bại:", err);
  }

  return NextResponse.json({ ok: true });
}
