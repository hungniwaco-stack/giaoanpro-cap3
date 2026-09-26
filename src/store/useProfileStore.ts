import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EMPTY_MAU, type MauTruong } from "@/lib/mau-truong";

interface ProfileState {
  name: string;
  school: string;
  mau: MauTruong;
  setProfile: (name: string, school: string) => void;
  setMau: (patch: Partial<MauTruong>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "Giáo viên",
      school: "",
      mau: EMPTY_MAU,
      setProfile: (name, school) => set({ name, school }),
      setMau: (patch) => set((s) => ({ mau: { ...s.mau, ...patch } })),
    }),
    { name: "giao-an-pro-profile" }
  )
);
