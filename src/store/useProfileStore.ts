import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileState {
  name: string;
  school: string;
  setProfile: (name: string, school: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "Giáo viên",
      school: "",
      setProfile: (name, school) => set({ name, school }),
    }),
    { name: "giao-an-pro-profile" }
  )
);
