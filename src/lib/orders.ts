import { randomBytes } from "crypto";
import { redis } from "./redis";
import { PLAN_PRICE_VND, type Plan } from "./plans";

export interface Order {
  refCode: string;
  uid: string;
  phone: string;
  email: string;
  plan: Plan;
  amount: number;
  status: "pending" | "paid";
  createdAt: number;
  paidAt?: number;
}

const ORDER_TTL_S = 60 * 60 * 24; // đơn chưa thanh toán tự hết hạn sau 1 ngày

function genRefCode(): string {
  // "GA" + 6 ký tự hex viết hoa — ngắn, gõ tay được nếu quét QR lỗi, và
  // dùng luôn làm mã kích hoạt sau khi thanh toán (một mã, hai vai trò).
  return "GA" + randomBytes(3).toString("hex").toUpperCase();
}

export async function createOrder(uid: string, phone: string, email: string, plan: Plan): Promise<Order> {
  const refCode = genRefCode();
  const order: Order = {
    refCode,
    uid,
    phone,
    email,
    plan,
    amount: PLAN_PRICE_VND[plan],
    status: "pending",
    createdAt: Date.now(),
  };
  await redis.set(`order:${refCode}`, order, { ex: ORDER_TTL_S });
  return order;
}

export async function getOrder(refCode: string): Promise<Order | null> {
  return redis.get<Order>(`order:${refCode}`);
}

export async function markOrderPaid(refCode: string): Promise<Order | null> {
  const order = await getOrder(refCode);
  if (!order || order.status === "paid") return order;
  order.status = "paid";
  order.paidAt = Date.now();
  await redis.set(`order:${refCode}`, order, { ex: ORDER_TTL_S });
  return order;
}

// Nội dung chuyển khoản ngân hàng trả về thường có thêm chữ ngân hàng tự
// chèn (tên chủ TK, mã giao dịch...), nên tìm mã đơn theo substring thay vì
// so khớp tuyệt đối toàn bộ chuỗi.
export function extractRefCode(content: string): string | null {
  const match = content.toUpperCase().replace(/\s+/g, "").match(/GA[0-9A-F]{6}/);
  return match ? match[0] : null;
}
