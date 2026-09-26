"use client";

import { useEffect } from "react";
import { syncTrialsFromServer } from "@/store/useAppStore";

// Đồng bộ số lượt dùng thử với server mỗi khi mở app.
export default function TrialSync() {
  useEffect(() => {
    syncTrialsFromServer();
  }, []);
  return null;
}
