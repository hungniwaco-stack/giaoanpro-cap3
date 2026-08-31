import pptxgen from "pptxgenjs";
import type { LessonPlan, ExamPlan, ExercisePlan } from "./types";

// ponytail: bảng màu + font tối giản (tối đa 3 màu, 1 font duy nhất) và đường
// kẻ chia dưới tiêu đề — theo nguyên tắc trình bày academic-pptx-skill
// (github.com/Gabberflast/academic-pptx-skill), chuyển sang giọng phổ thông.
// Dùng Arial thay vì font hiển thị web (Literata/Be Vietnam Pro) vì PowerPoint
// trên máy giáo viên thường không cài các font đó — Arial luôn có sẵn.
const PINE = "1B6B4C";
const INK = "20291F";
const PAPER = "FAF6EC";
const RULE = "CFC7AE";
const FONT = "Arial";
const MARGIN = 0.6;

function newDeck() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "SLIDE_16x9", width: 10, height: 5.63 });
  pptx.layout = "SLIDE_16x9";
  return pptx;
}

function addTitleSlide(pptx: pptxgen, title: string, meta: string) {
  const slide = pptx.addSlide();
  slide.background = { color: PINE };
  slide.addText(title, {
    x: MARGIN, y: 1.9, w: 8.8, h: 1.4,
    fontFace: FONT, fontSize: 30, bold: true, color: PAPER, valign: "top",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MARGIN, y: 3.15, w: 1.4, h: 0.03, fill: { color: PAPER },
  });
  slide.addText(meta, {
    x: MARGIN, y: 3.3, w: 8.8, h: 0.6,
    fontFace: FONT, fontSize: 15, color: PAPER,
  });
}

function addBulletSlide(pptx: pptxgen, heading: string, bullets: string[]) {
  const slide = pptx.addSlide();
  slide.background = { color: PAPER };
  slide.addText(heading, {
    x: MARGIN, y: 0.35, w: 8.8, h: 0.6,
    fontFace: FONT, fontSize: 22, bold: true, color: PINE, valign: "top",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MARGIN, y: 1.0, w: 8.8, h: 0.02, fill: { color: RULE },
  });
  slide.addText(
    bullets.filter(Boolean).map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
    { x: MARGIN, y: 1.25, w: 8.8, h: 4, fontFace: FONT, fontSize: 16, color: INK, valign: "top", paraSpaceAfter: 8 }
  );
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

export function generateLessonPlanPptx(plan: LessonPlan): pptxgen {
  const pptx = newDeck();
  addTitleSlide(pptx, plan.tenBai, `${plan.monHoc} · ${plan.khoiLop} · ${plan.thoiLuong}`);

  addBulletSlide(pptx, "Mục tiêu: Kiến thức", plan.mucTieuKienThuc);
  addBulletSlide(pptx, "Mục tiêu: Năng lực", plan.mucTieuNangLuc);
  addBulletSlide(pptx, "Mục tiêu: Phẩm chất", plan.mucTieuPhamChat);

  for (const hd of plan.hoatDong) {
    addBulletSlide(pptx, hd.ten, splitSentences(hd.noiDung));
  }

  return pptx;
}

export function generateExamPptx(exam: ExamPlan): pptxgen {
  const pptx = newDeck();
  addTitleSlide(pptx, exam.tenBai, `${exam.monHoc} · ${exam.khoiLop} · ${exam.thoiGianLamBai}`);

  exam.cauHoi.forEach((c, i) => {
    const lines = c.loai === "trac_nghiem" && c.luaChon ? c.luaChon : [];
    addBulletSlide(pptx, `Câu ${i + 1}`, [c.noiDung, ...lines]);
  });

  addBulletSlide(pptx, "Đáp án", exam.cauHoi.map((c, i) => `Câu ${i + 1}: ${c.dapAn}`));

  return pptx;
}

export function generateExercisePptx(ex: ExercisePlan): pptxgen {
  const pptx = newDeck();
  addTitleSlide(pptx, ex.tenBai, `${ex.monHoc} · ${ex.khoiLop}`);

  ex.baiTap.forEach((b, i) => {
    addBulletSlide(pptx, `Bài ${i + 1}`, splitSentences(b.noiDung));
  });

  addBulletSlide(pptx, "Đáp án", ex.baiTap.map((b, i) => `Bài ${i + 1}: ${b.dapAn}`));

  return pptx;
}

export async function downloadPptx(pptx: pptxgen, fileName: string) {
  await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
