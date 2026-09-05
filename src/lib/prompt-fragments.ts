// Dòng chỉ thị dùng chung cho mọi Master Prompt gọi Gemini — đảm bảo công
// thức Toán/Lý/Hóa được viết bằng LaTeX để hiển thị đúng ký hiệu (KaTeX ở
// màn hình xem trước) thay vì đánh vần chữ cái Hy Lạp (vd "omega", "phi").
export const LATEX_INSTRUCTION =
  'Với công thức Toán/Lý/Hóa: viết bằng cú pháp LaTeX chuẩn, đặt trong dấu $...$ cho công thức trong dòng hoặc $$...$$ cho công thức riêng một dòng (ví dụ: "$\\omega = 2\\pi f$", không viết "omega = 2*pi*f").';
