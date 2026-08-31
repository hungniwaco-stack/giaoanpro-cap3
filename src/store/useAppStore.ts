import { create } from "zustand";
import { persist } from "zustand/middleware";

const FREE_TRIALS = 2;

interface AppState {
  trialsUsed: number;
  isVip: boolean;
  vipExpiresAt: number | null;
  useTrial: () => void;
  activate: (expiresAt: number) => void;
  trialsLeft: () => number;
  canGenerate: () => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      trialsUsed: 0,
      isVip: false,
      vipExpiresAt: null,
      useTrial: () => set((s) => ({ trialsUsed: s.trialsUsed + 1 })),
      activate: (expiresAt) => set({ isVip: true, vipExpiresAt: expiresAt }),
      trialsLeft: () => Math.max(0, FREE_TRIALS - get().trialsUsed),
      canGenerate: () => {
        const s = get();
        if (s.isVip && s.vipExpiresAt && s.vipExpiresAt > Date.now()) return true;
        return s.trialsUsed < FREE_TRIALS;
      },
    }),
    { name: "giao-an-pro-storage" }
  )
);

export { FREE_TRIALS };
