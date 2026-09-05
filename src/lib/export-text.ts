import type { LessonPlan, ExamPlan, ExercisePlan, CauHoiThi } from "./types";
import { MUC_DO_LABEL, MUC_DO_ORDER } from "./types";

function groupByMucDo<T extends CauHoiThi>(cauHoi: T[]) {
  return MUC_DO_ORDER.map((mucDo) => ({ mucDo, cauHoi: cauHoi.filter((c) => c.mucDo === mucDo) })).filter(
    (g) => g.cauHoi.length > 0
  );
}

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
  const indexed = p.cauHoi.map((c, i) => ({ ...c, so: i + 1 }));
  const groups = groupByMucDo(indexed);

  const questions = groups
    .map(({ mucDo, cauHoi }) => {
      const items = cauHoi
        .map((c) => {
          const options = c.loai === "trac_nghiem" && c.luaChon ? "\n" + c.luaChon.map((o) => `  - ${o}`).join("\n") : "";
          return `${c.so}. ${c.noiDung}${options}`;
        })
        .join("\n\n");
      return `### Mức độ: ${MUC_DO_LABEL[mucDo]} (${cauHoi.length} câu)\n${items}`;
    })
    .join("\n\n");
  const answers = indexed.map((c) => `${c.so}. ${c.dapAn}`).join("\n");

  return `# ${p.tenBai}
**Môn:** ${p.monHoc} — **Lớp:** ${p.khoiLop} — **Thời gian làm bài:** ${p.thoiGianLamBai}

## Ma trận mức độ
${groups.map((g) => `- **${MUC_DO_LABEL[g.mucDo]}:** ${g.cauHoi.length} câu`).join("\n")}

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
