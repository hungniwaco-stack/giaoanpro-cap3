"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useProfileStore } from "@/store/useProfileStore";

export default function CauHinhPage() {
  const { name, school, setProfile } = useProfileStore();
  const { isVip, vipExpiresAt } = useAppStore();
  const [localName, setLocalName] = useState(name);
  const [localSchool, setLocalSchool] = useState(school);
  const [saved, setSaved] = useState(false);

  // useProfileStore only reads localStorage after mount — resync the local
  // inputs once the real persisted name/school lands, otherwise a returning
  // teacher sees the SSR default ("Giáo viên") instead of what they saved.
  useEffect(() => {
    setLocalName(name);
    setLocalSchool(school);
  }, [name, school]);

  // Same hydration-timing issue: isVip/vipExpiresAt only reflect their real
  // (persisted) value after mount, and the two branches below render
  // different elements, not just different text, so defer past mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleSave() {
    setProfile(localName.trim() || "Giáo viên", localSchool.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main className="px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Cấu Hình Cá Nhân</h1>
      <p className="mt-1 text-sm text-ink-muted">Thông tin hiển thị trên thanh bên và trạng thái gói sử dụng.</p>

      <div className="mt-8 max-w-md rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm">
        <div>
          <label className="text-sm text-ink-muted">Họ tên</label>
          <input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-pine"
          />
        </div>
        <div className="mt-4">
          <label className="text-sm text-ink-muted">Trường công tác</label>
          <input
            value={localSchool}
            onChange={(e) => setLocalSchool(e.target.value)}
            maxLength={150}
            placeholder="Ví dụ: THPT Nguyễn Du"
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink placeholder:text-ink-muted/50 outline-none focus:border-pine"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full rounded-xl bg-pine py-2.5 font-semibold text-paper transition hover:bg-pine-dark"
        >
          {saved ? "Đã lưu" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="mt-6 max-w-md rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm">
        <p className="text-sm text-ink-muted">Trạng thái gói</p>
        {mounted && isVip && vipExpiresAt ? (
          <p className="mt-1 font-medium text-pine-dark">
            VIP — hết hạn {new Date(vipExpiresAt).toLocaleDateString("vi-VN")}
          </p>
        ) : (
          <p className="mt-1 font-medium text-ink">Đang dùng thử miễn phí</p>
        )}
      </div>
    </main>
  );
}
