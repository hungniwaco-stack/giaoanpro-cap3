"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useProfileStore } from "@/store/useProfileStore";
import { MAU_LIMITS } from "@/lib/mau-truong";
import ActivationModal from "@/components/ActivationModal";

// Ảnh chụp bằng điện thoại thường 3-8MB, vượt trần upload — thu nhỏ trước khi gửi.
async function shrinkImage(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function MauTruongForm() {
  const { mau, setMau } = useProfileStore();
  const { isVip, trialsLeft } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Store đọc localStorage sau khi mount — chỉ render form sau đó để tránh lệch hydration.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return null;

  async function handleFile(file: File) {
    setError(null);
    if (mau.taiLieu.length >= MAU_LIMITS.maxTaiLieu) {
      setError(`Chỉ đính kèm tối đa ${MAU_LIMITS.maxTaiLieu} tài liệu — hãy xoá bớt một tài liệu cũ`);
      return;
    }
    setBusy(true);
    try {
      const prepared = file.type.startsWith("image/") ? await shrinkImage(file) : file;
      if (prepared.size > MAU_LIMITS.fileBytes) {
        throw new Error("File quá 4MB — hãy nén file hoặc chỉ giữ các trang cần thiết");
      }
      const fd = new FormData();
      fd.append("file", prepared, file.name);
      const res = await fetch("/api/phan-tich-mau", { method: "POST", body: fd });
      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đã có lỗi xảy ra");

      // Đọc lại store sau await — người dùng có thể đã sửa ô căn cứ trong lúc chờ.
      const cur = useProfileStore.getState().mau;
      setMau({
        taiLieu: [...cur.taiLieu, { ten: file.name, phanTich: data.huongDan }],
        canCu: cur.canCu || data.canCu,
      });
      if (!isVip) useAppStore.getState().useTrial("phan-tich");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mt-6 max-w-2xl rounded-2xl border border-ink/10 bg-paper-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-ink">Phụ lục của Sở</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Mỗi Sở có công văn và phụ lục riêng. Đính kèm phụ lục của Sở — AI đọc, phân tích rồi soạn giáo án sát
        yêu cầu của địa phương. Dữ liệu lưu trên trình duyệt này.
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink">Tài liệu đính kèm</p>
        <p className="mt-1 text-xs text-ink-muted">
          Công văn, phụ lục hoặc mẫu giáo án của Sở/trường — Word (.docx), PDF hoặc ảnh chụp, tối đa 4MB mỗi file,
          {" "}{MAU_LIMITS.maxTaiLieu} tài liệu.
        </p>

        {mau.taiLieu.length > 0 && (
          <ul className="mt-3 space-y-2">
            {mau.taiLieu.map((t, i) => (
              <li key={i} className="rounded-lg border border-ink/10 bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink">{t.ten}</span>
                  <button
                    onClick={() => setMau({ taiLieu: mau.taiLieu.filter((_, j) => j !== i) })}
                    className="shrink-0 text-xs text-seal hover:underline"
                  >
                    Xoá
                  </button>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{t.phanTich}</p>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".docx,.pdf,.png,.jpg,.jpeg,.webp,image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="mt-3 rounded-xl border border-pine px-4 py-2 text-sm font-semibold text-pine transition hover:bg-pine/5 disabled:opacity-50"
        >
          {busy ? "Đang đọc và phân tích..." : "Đính kèm file để AI phân tích"}
        </button>
        <p className="mt-2 text-xs text-ink-muted" suppressHydrationWarning>
          {isVip ? "Tài khoản VIP — phân tích không giới hạn" : `Còn ${trialsLeft("phan-tich")} lượt phân tích tài liệu miễn phí`}
        </p>
        {error && <p className="mt-2 text-sm text-seal">{error}</p>}
      </div>

      {showPaywall && <ActivationModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}
