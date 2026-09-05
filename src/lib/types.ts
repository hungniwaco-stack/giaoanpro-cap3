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

export type MucDo = "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao";

export const MUC_DO_LABEL: Record<MucDo, string> = {
  nhan_biet: "Nhận biết",
  thong_hieu: "Thông hiểu",
  van_dung: "Vận dụng",
  van_dung_cao: "Vận dụng cao",
};

export const MUC_DO_ORDER: MucDo[] = ["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"];

export interface CauHoiThi {
  loai: "trac_nghiem" | "tu_luan";
  mucDo: MucDo;
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
