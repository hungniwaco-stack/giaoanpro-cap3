export interface HoatDong {
  ten: string;
  mucTieu: string;
  noiDung: string;
  sanPham: string;
  toChucThucHien: string;
}

export interface LessonPlan {
  tenBai: string;
  monHoc: string;
  khoiLop: string;
  thoiLuong: string;
  mucTieuKienThuc: string[];
  mucTieuNangLuc: string[];
  mucTieuPhamChat: string[];
  thietBiDayHoc: string[];
  hoatDong: HoatDong[];
}

export interface CauHoiThi {
  loai: "trac_nghiem" | "tu_luan";
  noiDung: string;
  luaChon?: string[];
  dapAn: string;
}

export interface ExamPlan {
  tenBai: string;
  monHoc: string;
  khoiLop: string;
  thoiGianLamBai: string;
  cauHoi: CauHoiThi[];
}

export interface BaiTapItem {
  noiDung: string;
  dapAn: string;
}

export interface ExercisePlan {
  tenBai: string;
  monHoc: string;
  khoiLop: string;
  baiTap: BaiTapItem[];
}

export type HistoryType = "giao-an" | "de-thi" | "bai-tap";

export interface HistoryEntry {
  id: string;
  type: HistoryType;
  title: string;
  createdAt: number;
  data: LessonPlan | ExamPlan | ExercisePlan;
}
