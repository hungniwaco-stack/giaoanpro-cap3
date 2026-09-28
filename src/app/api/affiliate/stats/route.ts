import { NextRequest, NextResponse } from "next/server";
import { getAffiliateStats, verifyAffiliate } from "@/lib/affiliate";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const token = req.nextUrl.searchParams.get("t") ?? "";
  try {
    const aff = await verifyAffiliate(code, token);
    if (!aff) return NextResponse.json({ error: "Link không hợp lệ" }, { status: 404 });
    const stats = await getAffiliateStats(aff.code);
    return NextResponse.json(
      { code: aff.code, name: aff.name, bankName: aff.bankName, accountNumber: aff.accountNumber, ...stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Đọc số liệu cộng tác viên thất bại:", err);
    return NextResponse.json({ error: "Không tải được số liệu, vui lòng thử lại" }, { status: 500 });
  }
}
