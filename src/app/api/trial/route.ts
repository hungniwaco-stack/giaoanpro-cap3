import { NextRequest, NextResponse } from "next/server";
import { getTrialStatus } from "@/lib/trial-guard";

// Số lượt dùng thử thật nằm ở server — bộ đếm trong localStorage có thể lệch
// (xoá dữ liệu trình duyệt, lượt đã trừ nhưng trang không nhận được kết quả...).
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return NextResponse.json(await getTrialStatus(ip), { headers: { "Cache-Control": "no-store" } });
}
