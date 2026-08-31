import { Resend } from "resend";
import { PLAN_LABEL, type Plan } from "./plans";

const FROM = process.env.RESEND_FROM ?? "Giáo Án Pro <onboarding@resend.dev>";

// Khởi tạo lười — new Resend(undefined) throw ngay lúc import nếu thiếu key,
// sẽ sập cả build/mọi route khác. Chỉ tạo client khi thực sự gửi email.
export async function sendActivationEmail(to: string, code: string, plan: Plan) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY chưa cấu hình — bỏ qua gửi email kích hoạt");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Thanh toán thành công — Mã kích hoạt AI Giáo Án Pro",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#20291F">
        <h2 style="color:#1B6B4C">Thanh toán thành công!</h2>
        <p>Cảm ơn bạn đã nâng cấp gói <strong>${PLAN_LABEL[plan]}</strong>.</p>
        <p>Tài khoản trên trình duyệt bạn vừa thanh toán đã được kích hoạt tự động.</p>
        <p>Nếu muốn dùng trên thiết bị khác, nhập mã kích hoạt sau vào ứng dụng:</p>
        <p style="font-size:22px;font-weight:bold;letter-spacing:2px;background:#F1EAD6;padding:12px 16px;border-radius:8px;text-align:center">${code}</p>
        <p style="font-size:13px;color:#5B6358">Mã dùng được tối đa 3 thiết bị. Giữ email này để tra cứu lại khi cần.</p>
      </div>
    `,
  });
}
