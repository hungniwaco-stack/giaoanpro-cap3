import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Feature = "generate" | "de-thi" | "bai-tap" | "chat" | "phan-tich";

const FREE_TRIALS_PER_FEATURE = 3;
const FEATURES: Feature[] = ["generate", "de-thi", "bai-tap", "chat", "phan-tich"];
// Paywall đặt tại điểm xuất file (Word/PPT), tách khỏi lượt xem/tạo — xem
// SKILL.md audit UX: giáo viên cần thấy đủ giá trị trước khi gặp bức tường phí.
const FREE_EXPORTS_PER_FEATURE = 1;

interface AppState {
  trialsUsed: Partial<Record<Feature, number>>;
  exportsUsed: Partial<Record<Feature, number>>;
  isVip: boolean;
  vipExpiresAt: number | null;
  useTrial: (feature: Feature) => void;
  syncTrials: (counts: Partial<Record<Feature, number>>, blocked: boolean) => void;
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
      syncTrials: (counts, blocked) =>
        set({
          trialsUsed: blocked
            ? Object.fromEntries(FEATURES.map((f) => [f, FREE_TRIALS_PER_FEATURE]))
            : counts,
        }),
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
    {
      name: "giao-an-pro-storage",
      // isVip tự lưu trong localStorage nhưng không tự hết hạn — nếu không sửa
      // lại ở đây, sau khi gói hết hạn thật (server đã chặn đúng ở /api/*),
      // các trang vẫn dùng "isVip" thô (không qua isActiveVip) để khoá/mở khoá
      // canExport, khiến khách hết hạn vẫn xuất file không giới hạn mãi mãi.
      onRehydrateStorage: () => (state) => {
        if (state?.isVip && (!state.vipExpiresAt || state.vipExpiresAt <= Date.now())) {
          state.isVip = false;
        }
      },
    }
  )
);

// Server là nguồn đúng về lượt dùng thử; ghi đè bộ đếm cục bộ bằng số của server.
export async function syncTrialsFromServer() {
  try {
    const res = await fetch("/api/trial", { cache: "no-store" });
    if (!res.ok) return;
    const { counts, blocked } = await res.json();
    useAppStore.getState().syncTrials(counts ?? {}, !!blocked);
  } catch {
    // mất mạng: giữ nguyên số cục bộ
  }
}

export { FREE_TRIALS_PER_FEATURE, FREE_EXPORTS_PER_FEATURE };
