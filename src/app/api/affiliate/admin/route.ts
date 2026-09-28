import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { listAffiliatesForAdmin, recordPayout } from "@/lib/affiliate";

// Khoá quản trị đặt ở biến môi trường AFFILIATE_ADMIN_KEY; chưa đặt thì tắt hẳn
// trang quản trị thay vì để mở.
function authorized(req: NextRequest) {
  const expected = process.env.AFFILIATE_ADMIN_KEY;
  if (!expected) return null;
  const given = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function deny(ok: boolean | null) {
  if (ok === null) return NextResponse.json({ error: "Chưa cấu hình AFFILIATE_ADMIN_KEY" }, { status: 503 });
  return ok ? null : NextResponse.json({ error: "Sai khoá quản trị" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const denied = deny(authorized(req));
  if (denied) return denied;
  return NextResponse.json({ affiliates: await listAffiliatesForAdmin() }, { headers: { "Cache-Control": "no-store" } });
}

// Ghi nhận đã chuyển khoản cho một CTV: body { code, amount } với amount = số dư hiện tại.
export async function POST(req: NextRequest) {
  const denied = deny(authorized(req));
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (typeof body?.code !== "string" || !Number.isInteger(body?.amount)) {
    return NextResponse.json({ error: "Thiếu mã CTV hoặc số tiền" }, { status: 400 });
  }
  const result = await recordPayout(body.code, body.amount);
  if (result === "mismatch") {
    return NextResponse.json({ error: "Số dư đã thay đổi — tải lại danh sách rồi thử lại" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
