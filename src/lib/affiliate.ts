import { randomBytes, timingSafeEqual } from "crypto";
import { redis } from "./redis";
import type { Order } from "./orders";

export { COMMISSION_RATE, AFFILIATE_LIMITS, commissionFor } from "./affiliate-limits";
import { commissionFor } from "./affiliate-limits";

export interface Affiliate {
  code: string;
  token: string;
  name: string;
  email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: number;
}

export interface Commission {
  orderRef: string;
  plan: string;
  amount: number;
  commission: number;
  customer: string;
  at: number;
}

interface Payout {
  amount: number;
  at: number;
}

export const CODE_RE = /^[0-9A-F]{8}$/;

function maskEmail(email: string) {
  const [user, domain = ""] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function getAffiliate(code: string): Promise<Affiliate | null> {
  if (!CODE_RE.test(code)) return null;
  return redis.get<Affiliate>(`aff:${code}`);
}

export async function verifyAffiliate(code: string, token: string): Promise<Affiliate | null> {
  const aff = await getAffiliate(code);
  return aff && safeEqual(aff.token, token) ? aff : null;
}

// Đăng ký lại bằng email đã có thì trả về CTV cũ (để gửi lại link xem số liệu
// tới đúng hộp thư đó) — không tạo mã thứ hai và không đổi thông tin ngân hàng.
export async function registerAffiliate(
  input: Pick<Affiliate, "name" | "email" | "bankName" | "accountNumber" | "accountName">
): Promise<{ aff: Affiliate; isNew: boolean }> {
  const email = input.email.toLowerCase();
  const existing = await redis.get<string>(`aff:email:${email}`);
  if (existing) {
    const aff = await getAffiliate(existing);
    if (aff) return { aff, isNew: false };
  }
  const aff: Affiliate = {
    ...input,
    email,
    code: randomBytes(4).toString("hex").toUpperCase(),
    token: randomBytes(16).toString("hex"),
    createdAt: Date.now(),
  };
  await redis.set(`aff:${aff.code}`, aff);
  await redis.set(`aff:email:${email}`, aff.code);
  await redis.sadd("aff:list", aff.code);
  return { aff, isNew: true };
}

// Khách đã gắn với CTV nào ở lần mua đầu thì mọi lần mua sau (gia hạn, đổi gói)
// đều thuộc CTV đó — đây là "trọn đời". Chưa gắn thì dùng mã từ cookie giới thiệu.
export async function resolveOrderAffiliate(email: string, cookieCode?: string): Promise<string | null> {
  const bound = await redis.get<string>(`aff:cust:${email.toLowerCase()}`);
  if (bound) return bound;
  if (cookieCode && CODE_RE.test(cookieCode) && (await getAffiliate(cookieCode))) return cookieCode;
  return null;
}

// Gọi sau khi đơn đã thanh toán và tài khoản khách đã kích hoạt. Không bao giờ
// được chặn việc kích hoạt, nên người gọi phải tự bắt lỗi.
export async function recordCommission(order: Order) {
  if (!order.affCode) return;
  const aff = await getAffiliate(order.affCode);
  const customerEmail = order.email.toLowerCase();
  if (!aff || aff.email === customerEmail) return; // không tính đơn tự giới thiệu

  // Chống ghi trùng nếu webhook bị gọi lại cho cùng một đơn.
  if (!(await redis.set(`aff:done:${order.refCode}`, 1, { nx: true }))) return;
  await redis.set(`aff:cust:${customerEmail}`, aff.code, { nx: true });

  const entry: Commission = {
    orderRef: order.refCode,
    plan: order.plan,
    amount: order.amount,
    commission: commissionFor(order.amount),
    customer: maskEmail(order.email),
    at: Date.now(),
  };
  await redis.rpush(`aff:comm:${aff.code}`, entry);
}

export async function getAffiliateStats(code: string) {
  const [comms, pays] = await Promise.all([
    redis.lrange<Commission>(`aff:comm:${code}`, 0, -1),
    redis.lrange<Payout>(`aff:pay:${code}`, 0, -1),
  ]);
  const earned = comms.reduce((sum, c) => sum + c.commission, 0);
  const paid = pays.reduce((sum, p) => sum + p.amount, 0);
  return {
    earned,
    paid,
    balance: earned - paid,
    orders: comms.length,
    customers: new Set(comms.map((c) => c.customer)).size,
    recent: comms.slice(-50).reverse(),
  };
}

export async function listAffiliatesForAdmin() {
  const codes = await redis.smembers("aff:list");
  const rows = await Promise.all(
    codes.map(async (code) => {
      const aff = await getAffiliate(code);
      if (!aff) return null;
      const { earned, paid, balance, orders } = await getAffiliateStats(code);
      const { token, ...safe } = aff;
      // Chủ hệ thống có khoá quản trị thì được xem link riêng của CTV — dùng để gửi tay khi email không tới.
      return { ...safe, dashboardPath: `/doi-tac/xem?code=${aff.code}&t=${token}`, earned, paid, balance, orders };
    })
  );
  return rows.filter((r) => r !== null).sort((a, b) => b.balance - a.balance);
}

// Ghi nhận đã chuyển khoản. Chỉ nhận đúng số dư hiện tại — nếu giữa lúc bạn xem
// và bấm có thêm hoa hồng mới, số tiền lệch sẽ bị từ chối để không ghi sai sổ.
export async function recordPayout(code: string, amount: number): Promise<"ok" | "mismatch"> {
  const { balance } = await getAffiliateStats(code);
  if (balance <= 0 || amount !== balance) return "mismatch";
  await redis.rpush(`aff:pay:${code}`, { amount, at: Date.now() } satisfies Payout);
  return "ok";
}

// Giới hạn đăng ký theo IP: form công khai và mỗi lần gửi là một email gửi ra.
export async function allowRegistration(ip: string): Promise<boolean> {
  const key = `aff:reg:${ip}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60 * 60);
  return n <= 5;
}
