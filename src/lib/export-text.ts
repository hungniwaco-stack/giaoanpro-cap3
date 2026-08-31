import type { LessonPlan, ExamPlan, ExercisePlan } from "./types";

function bullets(items: string[]) {
  return items.map((i) => `- ${i}`).join("\n");
}

export function lessonPlanToMarkdown(p: LessonPlan): string {
  return `# ${p.tenBai}
**Môn:** ${p.monHoc} — **Lớp:** ${p.khoiLop} — **Thời lượng:** ${p.thoiLuong}

## I. Mục tiêu
**1. Kiến thức**
${bullets(p.mucTieuKienThuc)}

**2. Năng lực**
${bullets(p.mucTieuNangLuc)}

**3. Phẩm chất**
${bullets(p.mucTieuPhamChat)}

## II. Thiết bị dạy học và học liệu
${bullets(p.thietBiDayHoc)}

## III. Tiến trình dạy học
${p.hoatDong
  .map(
    (hd) => `### ${hd.ten}
- **Mục tiêu:** ${hd.mucTieu}
- **Nội dung:** ${hd.noiDung}
- **Sản phẩm:** ${hd.sanPham}
- **Tổ chức thực hiện:** ${hd.toChucThucHien}`
  )
  .join("\n\n")}
`;
}

export function examToMarkdown(p: ExamPlan): string {
  const questions = p.cauHoi
    .map((c, i) => {
      const options = c.loai === "trac_nghiem" && c.luaChon ? "\n" + c.luaChon.map((o) => `  - ${o}`).join("\n") : "";
      return `${i + 1}. ${c.noiDung}${options}`;
    })
    .join("\n\n");
  const answers = p.cauHoi.map((c, i) => `${i + 1}. ${c.dapAn}`).join("\n");

  return `# ${p.tenBai}
**Môn:** ${p.monHoc} — **Lớp:** ${p.khoiLop} — **Thời gian làm bài:** ${p.thoiGianLamBai}

## Đề bài
${questions}

## Đáp án
${answers}
`;
}

export function exerciseToMarkdown(p: ExercisePlan): string {
  const items = p.baiTap.map((b, i) => `${i + 1}. ${b.noiDung}`).join("\n\n");
  const answers = p.baiTap.map((b, i) => `${i + 1}. ${b.dapAn}`).join("\n");

  return `# ${p.tenBai}
**Môn:** ${p.monHoc} — **Lớp:** ${p.khoiLop}

## Bài tập
${items}

## Đáp án
${answers}
`;
}
