import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách bảo mật — AI Giáo Án Pro 2026" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updatedAt="30/08/2026">
      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>Nội dung bạn nhập để tạo giáo án (môn học, khối lớp, tên bài).</li>
        <li>Một mã định danh ẩn danh (cookie) để đếm số lượt dùng thử và trạng thái kích hoạt.</li>
        <li>Địa chỉ IP, chỉ dùng để chống lạm dụng lượt dùng thử miễn phí.</li>
      </ul>
      <p>Chúng tôi không yêu cầu đăng ký tài khoản, không thu thập mật khẩu hay thông tin thẻ thanh toán trên website.</p>

      <h2>2. Cách dữ liệu được sử dụng</h2>
      <p>
        Nội dung bạn nhập được gửi đến Google Gemini API để sinh giáo án và không được lưu trữ lâu
        dài trên máy chủ của chúng tôi sau khi trả kết quả. Cookie định danh chỉ tồn tại trên trình
        duyệt của bạn.
      </p>

      <h2>3. Chia sẻ với bên thứ ba</h2>
      <p>
        Dữ liệu đầu vào được gửi tới Google (nhà cung cấp Gemini API) để xử lý AI, theo chính sách
        bảo mật của Google. Chúng tôi không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích
        quảng cáo.
      </p>

      <h2>4. Quyền của bạn</h2>
      <p>
        Bạn có thể xoá cookie định danh bất kỳ lúc nào qua cài đặt trình duyệt, việc này sẽ đặt lại
        trạng thái dùng thử của bạn.
      </p>
    </LegalPage>
  );
}
