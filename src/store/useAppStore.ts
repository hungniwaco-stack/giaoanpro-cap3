import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Feature = "generate" | "de-thi" | "bai-tap" | "chat";

const FREE_TRIALS_PER_FEATURE = 3;

interface AppState {
  trialsUsed: Partial<Record<Feature, number>>;
  isVip: boolean;
  vipExpiresAt: number | null;
  useTrial: (feature: Feature) => void;
  activate: (expiresAt: number) => void;
  trialsLeft: (feature: Feature) => number;
  canGenerate: (feature: Feature) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      trialsUsed: {},
      isVip: false,
      vipExpiresAt: null,
      useTrial: (feature) =>
        set((s) => ({ trialsUsed: { ...s.trialsUsed, [feature]: (s.trialsUsed[feature] ?? 0) + 1 } })),
      activate: (expiresAt) => set({ isVip: true, vipExpiresAt: expiresAt }),
      trialsLeft: (feature) => Math.max(0, FREE_TRIALS_PER_FEATURE - (get().trialsUsed[feature] ?? 0)),
      canGenerate: (feature) => {
        const s = get();
        if (s.isVip && s.vipExpiresAt && s.vipExpiresAt > Date.now()) return true;
        return (s.trialsUsed[feature] ?? 0) < FREE_TRIALS_PER_FEATURE;
      },
    }),
    { name: "giao-an-pro-storage" }
  )
);

export { FREE_TRIALS_PER_FEATURE };
