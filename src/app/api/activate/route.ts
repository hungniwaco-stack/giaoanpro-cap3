import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { activateUid, tryRedeemCode } from "@/lib/trial-guard";
import { redis } from "@/lib/redis";
import { PLAN_DAYS, type Plan } from "@/lib/plans";

function readStaticCodes(): Record<string, Plan> {
  // ACTIVATION_CODES="ABC123:1M,DEF456:6M,GHI789:1Y" — mã cấp tay qua Zalo.
  const raw = process.env.ACTIVATION_CODES ?? "";
  const map: Record<string, Plan> = {};
  for (const pair of raw.split(",")) {
    const [code, plan] = pair.split(":");
    if (code && plan && plan in PLAN_DAYS) map[code.trim().toUpperCase()] = plan.trim() as Plan;
  }
  return map;
}

async function resolvePlan(normalizedCode: string): Promise<Plan | null> {
  const staticCodes = readStaticCodes();
  if (staticCodes[normalizedCode]) return staticCodes[normalizedCode];

  // Mã do webhook SePay tự phát hành sau khi thanh toán tự động thành công.
  const issued = await redis.get<{ plan: Plan }>(`issued_code:${normalizedCode}`);
  return issued?.plan ?? null;
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Thiếu mã kích hoạt" }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();
  const plan = await resolvePlan(normalizedCode);
  if (!plan) {
    return NextResponse.json({ error: "Mã kích hoạt không hợp lệ" }, { status: 403 });
  }

  const jar = await cookies();
  let uid = jar.get("giao_an_uid")?.value;
  if (!uid) {
    uid = randomUUID();
    jar.set("giao_an_uid", uid, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }

  if (!(await tryRedeemCode(normalizedCode, uid))) {
    return NextResponse.json(
      { error: "Mã kích hoạt đã đạt giới hạn số thiết bị sử dụng. Vui lòng liên hệ hỗ trợ." },
      { status: 403 }
    );
  }

  const expiresAt = Date.now() + PLAN_DAYS[plan] * 24 * 60 * 60 * 1000;
  await activateUid(uid, expiresAt);

  return NextResponse.json({ ok: true, expiresAt });
}
