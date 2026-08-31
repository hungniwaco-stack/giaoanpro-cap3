import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryEntry, HistoryType, LessonPlan, ExamPlan, ExercisePlan } from "@/lib/types";

const MAX_ENTRIES = 50;

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (type: HistoryType, title: string, data: LessonPlan | ExamPlan | ExercisePlan) => void;
  removeEntry: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (type, title, data) =>
        set((s) => ({
          entries: [
            { id: crypto.randomUUID(), type, title, createdAt: Date.now(), data },
            ...s.entries,
          ].slice(0, MAX_ENTRIES),
        })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: "giao-an-pro-history" }
  )
);
