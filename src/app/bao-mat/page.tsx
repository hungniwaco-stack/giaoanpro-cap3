import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách bảo mật — Giáo Án Pro Cấp 3" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updatedAt="07/09/2026">
      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>Nội dung bạn nhập để tạo giáo án, đề thi, bài tập (môn học, khối lớp, tên bài).</li>
        <li>Số điện thoại và email khi bạn mua gói trả phí, dùng để gửi mã kích hoạt và liên hệ hỗ trợ/hoàn tiền khi cần.</li>
        <li>Một mã định danh ẩn danh lưu trong cookie trình duyệt — không cần đăng ký tài khoản.</li>
        <li>Lịch sử các giáo án/đề thi/bài tập bạn đã tạo, lưu tối đa khoảng 400 ngày để bạn xem lại trong mục &quot;Lịch sử&quot;.</li>
        <li>Tên và tên trường bạn nhập ở mục Hồ sơ (để in vào file Word) — chỉ lưu trên trình duyệt của bạn, không gửi lên máy chủ.</li>
      </ul>
      <p>Chúng tôi không thu thập mật khẩu hay thông tin thẻ/tài khoản ngân hàng trên website.</p>

      <h2>2. Cách dữ liệu được sử dụng</h2>
      <p>
        Nội dung bạn nhập được gửi đến Google Gemini API để sinh nội dung. Email dùng để gửi mã
        kích hoạt sau khi thanh toán (qua Resend), không dùng cho mục đích quảng cáo. Số điện thoại
        chỉ dùng để đối chiếu khi bạn cần hỗ trợ hoặc yêu cầu hoàn tiền.
      </p>

      <h2>3. Chia sẻ với bên thứ ba</h2>
      <p>
        Dữ liệu được xử lý qua các dịch vụ: Google Gemini API (sinh nội dung AI), Resend (gửi email
        kích hoạt), Upstash Redis (lưu trữ dữ liệu tài khoản, lịch sử), và SePay (xác nhận giao
        dịch chuyển khoản ngân hàng). Chúng tôi không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục
        đích quảng cáo.
      </p>

      <h2>4. Thanh toán</h2>
      <p>
        Thanh toán thực hiện qua chuyển khoản VietQR do SePay xử lý. Chúng tôi không lưu trữ thông
        tin thẻ hoặc tài khoản ngân hàng của bạn trên hệ thống.
      </p>

      <h2>5. Quyền của bạn</h2>
      <p>
        Bạn có thể xoá cookie định danh bất kỳ lúc nào qua cài đặt trình duyệt. Liên hệ 0944 851719
        hoặc hungniwaco@gmail.com nếu muốn yêu cầu xoá lịch sử đã lưu.
      </p>
    </LegalPage>
  );
}
