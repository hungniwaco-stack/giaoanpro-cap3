import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createOrder } from "@/lib/orders";
import { PLAN_DAYS, type Plan } from "@/lib/plans";

const PHONE_RE = /^0\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { phone, email, plan } = await req.json();

  if (typeof plan !== "string" || !(plan in PLAN_DAYS)) {
    return NextResponse.json({ error: "Gói không hợp lệ" }, { status: 400 });
  }
  if (typeof phone !== "string" || !PHONE_RE.test(phone.trim())) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }

  const jar = await cookies();
  let uid = jar.get("giao_an_uid")?.value;
  if (!uid) {
    uid = randomUUID();
    jar.set("giao_an_uid", uid, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }

  try {
    const order = await createOrder(uid, phone.trim(), email.trim(), plan as Plan);

    const bankAccount = process.env.SEPAY_ACCOUNT_NUMBER ?? "";
    const bankCode = process.env.SEPAY_BANK_CODE ?? "";
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankCode}&amount=${order.amount}&des=${order.refCode}&template=compact`;

    return NextResponse.json({
      refCode: order.refCode,
      amount: order.amount,
      qrUrl,
      bankAccount,
      bankName: process.env.SEPAY_BANK_NAME ?? "",
      accountHolder: process.env.SEPAY_ACCOUNT_NAME ?? "",
    });
  } catch (err) {
    console.error("Tạo đơn hàng thất bại:", err);
    return NextResponse.json(
      { error: "Không thể tạo đơn hàng lúc này, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
