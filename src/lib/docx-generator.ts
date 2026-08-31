import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle,
} from "docx";
import type { LessonPlan, ExamPlan, ExercisePlan } from "./types";

const border = { style: BorderStyle.SINGLE, size: 2, color: "999999" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

function bulletList(items: string[]) {
  return items.map(
    (t) => new Paragraph({ text: t, bullet: { level: 0 } })
  );
}

function labeledCell(label: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
  });
}

function textCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    children: text.split("\n").map((line) => new Paragraph(line)),
  });
}

export function generateLessonPlanDocx(plan: LessonPlan): Document {
  const activityRows = plan.hoatDong.flatMap((hd) => [
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          borders: cellBorders,
          shading: { fill: "EEEEEE" },
          children: [new Paragraph({ children: [new TextRun({ text: hd.ten, bold: true })] })],
        }),
      ],
    }),
    new TableRow({ children: [labeledCell("a) Mục tiêu", 25), textCell(hd.mucTieu, 75)] }),
    new TableRow({ children: [labeledCell("b) Nội dung", 25), textCell(hd.noiDung, 75)] }),
    new TableRow({ children: [labeledCell("c) Sản phẩm", 25), textCell(hd.sanPham, 75)] }),
    new TableRow({ children: [labeledCell("d) Tổ chức thực hiện", 25), textCell(hd.toChucThucHien, 75)] }),
  ]);

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `KẾ HOẠCH BÀI DẠY`, bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: plan.tenBai, bold: true, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: `Môn: ${plan.monHoc} — Lớp: ${plan.khoiLop} — Thời lượng: ${plan.thoiLuong}`,
              italics: true,
            })],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({ heading: HeadingLevel.HEADING_2, text: "I. Mục tiêu" }),
          new Paragraph({ children: [new TextRun({ text: "1. Kiến thức", bold: true })] }),
          ...bulletList(plan.mucTieuKienThuc),
          new Paragraph({ children: [new TextRun({ text: "2. Năng lực", bold: true })] }),
          ...bulletList(plan.mucTieuNangLuc),
          new Paragraph({ children: [new TextRun({ text: "3. Phẩm chất", bold: true })] }),
          ...bulletList(plan.mucTieuPhamChat),

          new Paragraph({ heading: HeadingLevel.HEADING_2, text: "II. Thiết bị dạy học và học liệu" }),
          ...bulletList(plan.thietBiDayHoc),

          new Paragraph({ heading: HeadingLevel.HEADING_2, text: "III. Tiến trình dạy học" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: activityRows,
          }),
        ],
      },
    ],
  });
}

export function generateExamDocx(exam: ExamPlan): Document {
  const questionParagraphs = exam.cauHoi.flatMap((c, i) => {
    const paras = [new Paragraph({ children: [new TextRun({ text: `Câu ${i + 1}. ${c.noiDung}`, bold: true })] })];
    if (c.loai === "trac_nghiem" && c.luaChon) {
      paras.push(...c.luaChon.map((o) => new Paragraph({ text: o, indent: { left: 360 } })));
    }
    paras.push(new Paragraph({ text: "" }));
    return paras;
  });

  const answerParagraphs = exam.cauHoi.map(
    (c, i) => new Paragraph({ children: [new TextRun({ text: `Câu ${i + 1}: ${c.dapAn}` })] })
  );

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "ĐỀ KIỂM TRA", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: exam.tenBai, bold: true, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: `Môn: ${exam.monHoc} — Lớp: ${exam.khoiLop} — Thời gian làm bài: ${exam.thoiGianLamBai}`,
              italics: true,
            })],
          }),
          new Paragraph({ text: "" }),
          ...questionParagraphs,
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: "ĐÁP ÁN" }),
          ...answerParagraphs,
        ],
      },
    ],
  });
}

export function generateExerciseDocx(ex: ExercisePlan): Document {
  const items = ex.baiTap.flatMap((b, i) => [
    new Paragraph({ children: [new TextRun({ text: `Bài ${i + 1}. ${b.noiDung}` })] }),
    new Paragraph({ text: "" }),
  ]);
  const answers = ex.baiTap.map((b, i) => new Paragraph({ text: `Bài ${i + 1}: ${b.dapAn}` }));

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "PHIẾU BÀI TẬP", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: ex.tenBai, bold: true, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Môn: ${ex.monHoc} — Lớp: ${ex.khoiLop}`, italics: true })],
          }),
          new Paragraph({ text: "" }),
          ...items,
          new Paragraph({ heading: HeadingLevel.HEADING_2, text: "ĐÁP ÁN" }),
          ...answers,
        ],
      },
    ],
  });
}

export async function docxToBlob(doc: Document): Promise<Blob> {
  const base64 = await Packer.toBase64String(doc);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
