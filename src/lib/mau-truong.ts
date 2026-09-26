// Mẫu giáo án theo Sở/trường — lưu ở trình duyệt (useProfileStore), gửi kèm
// mỗi lần soạn. File này giữ y hệt nhau ở cap1/cap2/cap3.

export interface TaiLieuMau {
  ten: string;
  phanTich: string;
}

export interface MauTruong {
  to: string;
  canCu: string;
  ghiChu: string;
  nguoiDuyetCM: string;
  nguoiDuyetTo: string;
  inBangDuyet: boolean;
  taiLieu: TaiLieuMau[];
}

export const EMPTY_MAU: MauTruong = {
  to: "",
  canCu: "",
  ghiChu: "",
  nguoiDuyetCM: "",
  nguoiDuyetTo: "",
  inBangDuyet: false,
  taiLieu: [],
};

export const MAU_LIMITS = {
  short: 150,
  canCu: 300,
  ghiChu: 1500,
  phanTich: 3000,
  maxTaiLieu: 3,
  meta: 100,
  fileBytes: 4 * 1024 * 1024, // trần body của Vercel là 4.5MB
} as const;

// Phần gửi lên API soạn giáo án — chỉ gồm thứ AI cần đọc.
export interface MauGuide {
  canCu?: string;
  ghiChu?: string;
  huongDan?: string;
}

export function toMauGuide(m: MauTruong): MauGuide | undefined {
  const huongDan = m.taiLieu.map((t) => `[${t.ten}]\n${t.phanTich}`).join("\n\n");
  const guide: MauGuide = {
    canCu: m.canCu.trim() || undefined,
    ghiChu: m.ghiChu.trim() || undefined,
    huongDan: huongDan || undefined,
  };
  return guide.canCu || guide.ghiChu || guide.huongDan ? guide : undefined;
}

function optString(v: unknown, max: number): string | undefined | "bad" {
  if (v === undefined || v === null || v === "") return undefined;
  return typeof v === "string" && v.length <= max ? v : "bad";
}

// Kiểm tra ở biên tin cậy (server): body do client gửi, không được tin.
export function parseMauGuide(raw: unknown): { ok: true; value: MauGuide | undefined } | { ok: false } {
  if (raw === undefined || raw === null) return { ok: true, value: undefined };
  if (typeof raw !== "object") return { ok: false };
  const r = raw as Record<string, unknown>;
  const canCu = optString(r.canCu, MAU_LIMITS.canCu);
  const ghiChu = optString(r.ghiChu, MAU_LIMITS.ghiChu);
  const huongDan = optString(r.huongDan, MAU_LIMITS.phanTich * MAU_LIMITS.maxTaiLieu + 500);
  if (canCu === "bad" || ghiChu === "bad" || huongDan === "bad") return { ok: false };
  return { ok: true, value: { canCu, ghiChu, huongDan } };
}

export function parseMeta(v: unknown): string | undefined | "bad" {
  return optString(v, MAU_LIMITS.meta);
}

export function mauGuidePromptBlock(g?: MauGuide): string {
  if (!g) return "";
  const lines = [
    g.canCu && `- Căn cứ của địa phương/nhà trường: ${g.canCu}`,
    g.ghiChu && `- Yêu cầu riêng của Sở/trường: ${g.ghiChu}`,
    g.huongDan && `- Phân tích tài liệu hướng dẫn của Sở/trường:\n"""\n${g.huongDan}\n"""`,
  ].filter(Boolean);
  return `
Bối cảnh thực tế của địa phương/nhà trường — ưu tiên áp dụng: thuật ngữ, yêu cầu và cách diễn đạt trong nội dung phải bám sát các thông tin sau; vẫn giữ đúng cấu trúc JSON và số hoạt động đã nêu ở trên:
${lines.join("\n")}
`;
}
