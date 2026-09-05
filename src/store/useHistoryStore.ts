import { create } from "zustand";
import type { HistoryEntry, HistoryType, LessonPlan, ExamPlan, ExercisePlan } from "@/lib/types";

const MAX_ENTRIES = 50;

interface HistoryState {
  entries: HistoryEntry[];
  setEntries: (entries: HistoryEntry[]) => void;
  addEntry: (type: HistoryType, title: string, data: LessonPlan | ExamPlan | ExercisePlan) => void;
  removeEntry: (id: string) => void;
}

// Nguồn sự thật là Redis phía server (theo uid) — mỗi route sinh nội dung tự
// lưu vào đó. Store này chỉ là cache hiển thị phía client, không còn tự
// persist vào localStorage để tránh lệch với dữ liệu thật trên server.
export const useHistoryStore = create<HistoryState>()((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (type, title, data) =>
    set((s) => ({
      entries: [
        { id: crypto.randomUUID(), type, title, createdAt: Date.now(), data },
        ...s.entries,
      ].slice(0, MAX_ENTRIES),
    })),
  removeEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  },
}));
