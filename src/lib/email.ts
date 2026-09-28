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
  const { error } = await resend.emails.send({
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
  // SDK Resend trả lỗi trong `error` chứ không throw — không log thì gửi hỏng mà không ai biết.
  if (error) console.error("Resend từ chối gửi email kích hoạt:", error);
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Gửi link xem số liệu (chứa khoá bí mật) — chỉ gửi qua email, không hiện trên trang,
// để chỉ chủ hộp thư mới xem được số dư và thông tin ngân hàng của CTV.
export async function sendAffiliateEmail(to: string, name: string, code: string, origin: string, token: string) {
  const dashboardUrl = `${origin}/doi-tac/xem?code=${code}&t=${token}`;
  const referralUrl = `${origin}/?ref=${code}`;
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY chưa cấu hình — bỏ qua gửi email cộng tác viên");
    return { dashboardUrl, sent: false };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Đăng ký cộng tác viên Giáo Án Pro thành công",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#20291F">
        <h2 style="color:#1B6B4C">Chào ${escapeHtml(name)}, bạn đã là cộng tác viên!</h2>
        <p>Link giới thiệu của bạn (hoa hồng 30% mỗi lần khách thanh toán, trọn đời):</p>
        <p style="font-size:15px;background:#F1EAD6;padding:12px 16px;border-radius:8px;word-break:break-all">${referralUrl}</p>
        <p>Xem số khách, hoa hồng và số dư tại link riêng của bạn:</p>
        <p><a href="${dashboardUrl}" style="color:#1B6B4C">${dashboardUrl}</a></p>
        <p style="font-size:13px;color:#5B6358">Đây là link riêng, không chia sẻ cho người khác — ai có link này đều xem được số liệu của bạn.</p>
      </div>
    `,
  });
  if (error) console.error("Resend từ chối gửi email cộng tác viên:", error);
  return { dashboardUrl, sent: !error };
}
