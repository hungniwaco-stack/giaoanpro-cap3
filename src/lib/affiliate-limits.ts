// Phần dùng chung cho cả server lẫn client — không import crypto/redis vào đây.

// 30% mỗi lần khách được giới thiệu thanh toán, không giới hạn thời gian (trọn đời).
export const COMMISSION_RATE = 0.3;

export const AFFILIATE_LIMITS = { name: 100, email: 150, bank: 60, account: 20 } as const;

export function commissionFor(amount: number) {
  return Math.round(amount * COMMISSION_RATE);
}
