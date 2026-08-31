import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { redis } from "./redis";

const FREE_TRIALS = 2;
const DAY_S = 60 * 60 * 24;
const ENTRY_TTL_S = DAY_S * 400; // outlives the 1-year uid cookie
const IP_WINDOW_S = DAY_S;
const IP_DAILY_CAP = 6;

const MAX_ACTIVATIONS_PER_CODE = 3;

interface TrialEntry {
  count: number;
  activatedUntil: number | null;
}

interface IpEntry {
  count: number;
  windowStart: number;
}

async function ensureUid() {
  const jar = await cookies();
  let uid = jar.get("giao_an_uid")?.value;
  if (!uid) {
    uid = randomUUID();
    jar.set("giao_an_uid", uid, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return uid;
}

async function getTrialEntry(uid: string): Promise<TrialEntry> {
  return (await redis.get<TrialEntry>(`trial:${uid}`)) ?? { count: 0, activatedUntil: null };
}

async function getIpEntry(ip: string): Promise<IpEntry> {
  const entry = (await redis.get<IpEntry>(`ip:${ip}`)) ?? { count: 0, windowStart: Date.now() };
  if (Date.now() - entry.windowStart > IP_WINDOW_S * 1000) {
    return { count: 0, windowStart: Date.now() };
  }
  return entry;
}

// Check quota WITHOUT spending it — call before the (possibly failing)
// generation, then call consumeTrial only once it actually succeeds, so a
// Gemini error or bad key doesn't burn the user's free/paid quota for nothing.
export async function checkTrial(ip: string) {
  const uid = await ensureUid();
  const entry = await getTrialEntry(uid);
  const isVip = !!entry.activatedUntil && entry.activatedUntil > Date.now();
  if (isVip) return { allowed: true as const, uid, ip };

  const ipEntry = await getIpEntry(ip);
  if (entry.count >= FREE_TRIALS || ipEntry.count >= IP_DAILY_CAP) {
    return { allowed: false as const, uid, ip };
  }
  return { allowed: true as const, uid, ip };
}

export async function consumeTrial(uid: string, ip: string) {
  const entry = await getTrialEntry(uid);
  const isVip = !!entry.activatedUntil && entry.activatedUntil > Date.now();
  if (isVip) return;

  entry.count += 1;
  await redis.set(`trial:${uid}`, entry, { ex: ENTRY_TTL_S });

  const ipEntry = await getIpEntry(ip);
  ipEntry.count += 1;
  await redis.set(`ip:${ip}`, ipEntry, { ex: IP_WINDOW_S * 2 });
}

export async function activateUid(uid: string, untilMs: number) {
  const entry = await getTrialEntry(uid);
  entry.activatedUntil = untilMs;
  await redis.set(`trial:${uid}`, entry, { ex: ENTRY_TTL_S });
}

// Caps how many distinct browsers/devices can redeem the same activation
// code — a code is issued per paying customer, so a handful of activations
// covers phone + laptop + a reinstall, but stops a leaked code (e.g. posted
// in a Facebook group) from activating everyone who sees it.
// Returns false if this code has already hit its device cap on OTHER
// browsers — the same uid re-activating (e.g. after expiry) is always fine.
export async function tryRedeemCode(code: string, uid: string): Promise<boolean> {
  const key = `code:${code}`;
  const already = await redis.sismember(key, uid);
  if (already) return true;
  const size = await redis.scard(key);
  if (size >= MAX_ACTIVATIONS_PER_CODE) return false;
  await redis.sadd(key, uid);
  return true;
}

export async function getUid() {
  const jar = await cookies();
  return jar.get("giao_an_uid")?.value ?? null;
}
