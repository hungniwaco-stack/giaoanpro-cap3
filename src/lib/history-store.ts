import { randomUUID } from "crypto";
import { redis } from "./redis";
import type { HistoryEntry, HistoryType, LessonPlan, ExamPlan, ExercisePlan } from "./types";

const MAX_ENTRIES = 50;
const HISTORY_TTL_S = 60 * 60 * 24 * 400; // outlives the 1-year uid cookie, same as trial entries

export async function getHistory(uid: string): Promise<HistoryEntry[]> {
  return (await redis.get<HistoryEntry[]>(`history:${uid}`)) ?? [];
}

export async function addHistoryEntry(
  uid: string,
  type: HistoryType,
  title: string,
  data: LessonPlan | ExamPlan | ExercisePlan
) {
  const entries = await getHistory(uid);
  const next: HistoryEntry[] = [
    { id: randomUUID(), type, title, createdAt: Date.now(), data },
    ...entries,
  ].slice(0, MAX_ENTRIES);
  await redis.set(`history:${uid}`, next, { ex: HISTORY_TTL_S });
}

export async function removeHistoryEntry(uid: string, id: string) {
  const entries = await getHistory(uid);
  await redis.set(`history:${uid}`, entries.filter((e) => e.id !== id), { ex: HISTORY_TTL_S });
}
