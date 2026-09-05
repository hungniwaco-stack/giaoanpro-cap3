import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Feature = "generate" | "de-thi" | "bai-tap" | "chat";

const FREE_TRIALS_PER_FEATURE = 3;
// Paywall đặt tại điểm xuất file (Word/PPT), tách khỏi lượt xem/tạo — xem
// SKILL.md audit UX: giáo viên cần thấy đủ giá trị trước khi gặp bức tường phí.
const FREE_EXPORTS_PER_FEATURE = 1;

interface AppState {
  trialsUsed: Partial<Record<Feature, number>>;
  exportsUsed: Partial<Record<Feature, number>>;
  isVip: boolean;
  vipExpiresAt: number | null;
  useTrial: (feature: Feature) => void;
  useExport: (feature: Feature) => void;
  activate: (expiresAt: number) => void;
  trialsLeft: (feature: Feature) => number;
  canGenerate: (feature: Feature) => boolean;
  canExport: (feature: Feature) => boolean;
}

function isActiveVip(s: { isVip: boolean; vipExpiresAt: number | null }) {
  return s.isVip && !!s.vipExpiresAt && s.vipExpiresAt > Date.now();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      trialsUsed: {},
      exportsUsed: {},
      isVip: false,
      vipExpiresAt: null,
      useTrial: (feature) =>
        set((s) => ({ trialsUsed: { ...s.trialsUsed, [feature]: (s.trialsUsed[feature] ?? 0) + 1 } })),
      useExport: (feature) =>
        set((s) => ({ exportsUsed: { ...s.exportsUsed, [feature]: (s.exportsUsed[feature] ?? 0) + 1 } })),
      activate: (expiresAt) => set({ isVip: true, vipExpiresAt: expiresAt }),
      trialsLeft: (feature) => Math.max(0, FREE_TRIALS_PER_FEATURE - (get().trialsUsed[feature] ?? 0)),
      canGenerate: (feature) => {
        const s = get();
        if (isActiveVip(s)) return true;
        return (s.trialsUsed[feature] ?? 0) < FREE_TRIALS_PER_FEATURE;
      },
      canExport: (feature) => {
        const s = get();
        if (isActiveVip(s)) return true;
        return (s.exportsUsed[feature] ?? 0) < FREE_EXPORTS_PER_FEATURE;
      },
    }),
    { name: "giao-an-pro-storage" }
  )
);

export { FREE_TRIALS_PER_FEATURE, FREE_EXPORTS_PER_FEATURE };
