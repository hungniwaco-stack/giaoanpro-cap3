"use client";

import { useEffect } from "react";

const REF_RE = /^[0-9A-F]{8}$/i;
const WINDOW_S = 60 * 60 * 24 * 30; // khách mua trong 30 ngày sau khi bấm link vẫn tính cho CTV

// Lưu mã giới thiệu từ ?ref=... vào cookie. Đặt domain .giaoanpro.com để cả
// trang chủ lẫn các app cấp 1/2/3 cùng đọc được một mã.
export default function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref || !REF_RE.test(ref)) return;
    const domain = window.location.hostname.endsWith("giaoanpro.com") ? "; domain=.giaoanpro.com" : "";
    document.cookie = `gap_ref=${ref.toUpperCase()}; max-age=${WINDOW_S}; path=/; samesite=lax${domain}`;
  }, []);
  return null;
}
