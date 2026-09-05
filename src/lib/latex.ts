// ponytail: Word/PowerPoint không render được KaTeX như màn hình xem trước,
// nên chuyển các ký hiệu LaTeX phổ biến trong công thức Toán/Lý/Hóa THPT
// (chữ Hy Lạp, căn, phân số, mũ/chỉ số đơn giản) sang Unicode thuần tuý.
// Không xử lý ma trận/tích phân/tổng phức tạp — nâng cấp lên OMML (Word
// equation) nếu cần hiển thị đầy đủ công thức trong file xuất ra.
const SYMBOL_MAP: Record<string, string> = {
  "\\omega": "ω", "\\Omega": "Ω",
  "\\varphi": "φ", "\\phi": "φ", "\\Phi": "Φ",
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\Gamma": "Γ",
  "\\delta": "δ", "\\Delta": "Δ",
  "\\theta": "θ", "\\Theta": "Θ",
  "\\lambda": "λ", "\\Lambda": "Λ",
  "\\mu": "μ", "\\nu": "ν", "\\pi": "π", "\\Pi": "Π",
  "\\sigma": "σ", "\\Sigma": "Σ", "\\tau": "τ",
  "\\rho": "ρ", "\\eta": "η", "\\epsilon": "ε", "\\varepsilon": "ε",
  "\\times": "×", "\\div": "÷", "\\pm": "±", "\\mp": "∓",
  "\\cdot": "·", "\\approx": "≈", "\\neq": "≠", "\\leq": "≤", "\\geq": "≥",
  "\\infty": "∞", "\\degree": "°", "\\to": "→", "\\rightarrow": "→",
};

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "n": "ⁿ",
};
const SUBSCRIPT: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
};

function toScript(s: string, map: Record<string, string>): string {
  return s.split("").map((c) => map[c] ?? c).join("");
}

function convertLatexBody(latex: string): string {
  let s = latex;
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_, inner) => `√(${convertLatexBody(inner)})`);
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `(${convertLatexBody(a)})/(${convertLatexBody(b)})`);
  s = s.replace(/\^\{([^{}]*)\}/g, (_, inner) => toScript(inner, SUPERSCRIPT));
  s = s.replace(/\^([0-9a-zA-Z+-])/g, (_, c) => toScript(c, SUPERSCRIPT));
  s = s.replace(/_\{([^{}]*)\}/g, (_, inner) => toScript(inner, SUBSCRIPT));
  s = s.replace(/_([0-9])/g, (_, c) => toScript(c, SUBSCRIPT));
  for (const [cmd, sym] of Object.entries(SYMBOL_MAP)) {
    s = s.split(cmd).join(sym);
  }
  s = s.replace(/\\([a-zA-Z]+)/g, "$1"); // lệnh LaTeX không nhận diện được — bỏ dấu \
  s = s.replace(/[{}]/g, "");
  return s;
}

/** Chuyển "$...$" và "$$...$$" trong text sang ký hiệu Unicode thuần cho Word/PPT. */
export function latexToPlainText(text: string): string {
  if (!text) return text;
  let out = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => convertLatexBody(inner.trim()));
  out = out.replace(/\$([^$\n]+?)\$/g, (_, inner) => convertLatexBody(inner.trim()));
  return out;
}
