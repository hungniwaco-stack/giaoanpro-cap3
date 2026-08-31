import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ refCode: string }> }
) {
  const { refCode } = await params;
  try {
    const order = await getOrder(refCode.toUpperCase());
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    return NextResponse.json({ status: order.status, refCode: order.refCode });
  } catch (err) {
    console.error("Kiểm tra đơn hàng thất bại:", err);
    return NextResponse.json({ error: "Không thể kiểm tra đơn hàng lúc này" }, { status: 500 });
  }
}
