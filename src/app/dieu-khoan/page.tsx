import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Điều khoản sử dụng — AI Giáo Án Pro 2026" };

export default function TermsPage() {
  return (
    <LegalPage title="Điều khoản sử dụng" updatedAt="30/08/2026">
      <h2>1. Dịch vụ cung cấp</h2>
      <p>
        AI Giáo Án Pro 2026 là công cụ hỗ trợ giáo viên soạn thảo giáo án tham khảo dựa trên
        Công văn 5512/BGDĐT-GDTrH, sử dụng mô hình trí tuệ nhân tạo (Google Gemini) để tạo nội dung.
      </p>

      <h2>2. Nội dung do AI tạo ra</h2>
      <p>
        Nội dung giáo án được tạo tự động bởi AI và chỉ mang tính chất tham khảo. Giáo viên có
        trách nhiệm kiểm tra, chỉnh sửa lại nội dung kiến thức, số liệu và mục tiêu bài học trước
        khi sử dụng để giảng dạy hoặc nộp cho cơ quan quản lý. Chúng tôi không chịu trách nhiệm về
        tính chính xác tuyệt đối của nội dung do AI sinh ra.
      </p>

      <h2>3. Lượt dùng thử và gói trả phí</h2>
      <p>
        Người dùng được cấp một số lượt dùng thử miễn phí giới hạn. Sau khi hết lượt, cần kích
        hoạt gói trả phí (1 tháng / 6 tháng / 1 năm) để tiếp tục sử dụng không giới hạn trong thời
        hạn của gói.
      </p>

      <h2>4. Thanh toán</h2>
      <p>
        Việc thanh toán và cấp mã kích hoạt được thực hiện thủ công qua Zalo hoặc cổng chuyển
        khoản. Mã kích hoạt là duy nhất cho một thiết bị/trình duyệt và không được chia sẻ.
      </p>

      <h2>5. Giới hạn trách nhiệm</h2>
      <p>
        Dịch vụ được cung cấp theo hiện trạng (&quot;as-is&quot;). Chúng tôi không đảm bảo dịch vụ
        hoạt động liên tục không gián đoạn và không chịu trách nhiệm cho thiệt hại gián tiếp phát
        sinh từ việc sử dụng nội dung do AI tạo ra.
      </p>

      <h2>6. Liên hệ</h2>
      <p>Mọi thắc mắc vui lòng liên hệ qua Zalo hoặc email hỗ trợ được ghi ở cuối trang.</p>
    </LegalPage>
  );
}
