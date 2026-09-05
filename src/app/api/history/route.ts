import { NextRequest, NextResponse } from "next/server";
import { getUid } from "@/lib/trial-guard";
import { getHistory, removeHistoryEntry } from "@/lib/history-store";

export async function GET() {
  const uid = await getUid();
  return NextResponse.json(uid ? await getHistory(uid) : []);
}

export async function DELETE(req: NextRequest) {
  const uid = await getUid();
  const { id } = await req.json();
  if (uid && id) await removeHistoryEntry(uid, id);
  return NextResponse.json({ ok: true });
}
