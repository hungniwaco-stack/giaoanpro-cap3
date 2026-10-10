export const FEEDBACK_OPTIONS = [
  { id: "ok", label: "Dùng được, đúng ý tôi" },
  { id: "sai-noi-dung", label: "Nội dung chưa chính xác" },
  { id: "sai-khung", label: "Chưa đúng khung/mẫu của trường hoặc Sở" },
  { id: "chung-chung", label: "Quá chung chung, thiếu chi tiết" },
  { id: "chi-xem", label: "Tôi chỉ xem thử thôi" },
] as const;

export type FeedbackOptionId = (typeof FEEDBACK_OPTIONS)[number]["id"];

export const FEEDBACK_TEXT_MAX = 300;
