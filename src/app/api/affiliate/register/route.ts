import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_LIMITS as L, allowRegistration, registerAffiliate } from "@/lib/affiliate";
import { sendAffiliateEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_RE = /^\d{6,20}$/;

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim().length > 0 && v.trim().length <= max ? v.trim() : null);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = str(body?.name, L.name);
  const email = str(body?.email, L.email);
  const bankName = str(body?.bankName, L.bank);
  const accountName = str(body?.accountName, L.name);
  const accountNumber = str(body?.accountNumber, L.account)?.replace(/\s+/g, "") ?? null;

  if (!name || !email || !EMAIL_RE.test(email) || !bankName || !accountName || !accountNumber || !ACCOUNT_RE.test(accountNumber)) {
    return NextResponse.json({ error: "Vui lòng điền đủ và đúng họ tên, email, ngân hàng, số tài khoản, tên chủ tài khoản" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    if (!(await allowRegistration(ip))) {
      return NextResponse.json({ error: "Bạn đã gửi quá nhiều lần, vui lòng thử lại sau 1 giờ" }, { status: 429 });
    }
    const { aff, isNew } = await registerAffiliate({ name, email, bankName, accountName, accountNumber });
    const { dashboardUrl, sent } = await sendAffiliateEmail(aff.email, aff.name, aff.code, req.nextUrl.origin, aff.token);
    // Link chứa khoá bí mật chỉ đi qua email; riêng môi trường phát triển (chưa cấu hình email) trả về để thử.
    return NextResponse.json({ ok: true, isNew, emailSent: sent, ...(process.env.NODE_ENV !== "production" ? { devLink: dashboardUrl } : {}) });
  } catch (err) {
    console.error("Đăng ký cộng tác viên thất bại:", err);
    return NextResponse.json({ error: "Không đăng ký được lúc này, vui lòng thử lại sau" }, { status: 500 });
  }
}
