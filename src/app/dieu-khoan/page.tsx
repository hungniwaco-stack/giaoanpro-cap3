import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Điều khoản sử dụng — Giáo Án Pro Cấp 3" };

export default function TermsPage() {
  return (
    <LegalPage title="Điều khoản sử dụng" updatedAt="07/09/2026">
      <h2>1. Dịch vụ cung cấp</h2>
      <p>
        Giáo Án Pro Cấp 3 là công cụ hỗ trợ giáo viên THPT soạn giáo án, ra đề, tạo bài tập dựa
        trên Công văn 5512/BGDĐT-GDTrH, dùng AI (Google Gemini) để tạo nội dung.
      </p>

      <h2>2. Nội dung do AI tạo ra</h2>
      <p>
        Nội dung được tạo tự động bởi AI và chỉ mang tính chất tham khảo (bản nháp hỗ trợ). Giáo
        viên có trách nhiệm kiểm tra, chỉnh sửa lại nội dung, số liệu và mục tiêu bài học trước khi
        dùng để giảng dạy hoặc nộp cho tổ chuyên môn. Chúng tôi không chịu trách nhiệm về tính chính
        xác tuyệt đối của nội dung do AI sinh ra.
      </p>

      <h2>3. Dùng thử và gói trả phí</h2>
      <p>
        Mỗi trình duyệt được cấp một số lượt dùng thử miễn phí riêng cho từng tính năng (soạn giáo
        án, ra đề, tạo bài tập). Sau khi hết lượt, cần kích hoạt gói trả phí (1 Tháng / 6 Tháng / 1
        Năm) để tiếp tục sử dụng không giới hạn trong thời hạn gói.
      </p>

      <h2>4. Kích hoạt và thanh toán</h2>
      <p>
        Thanh toán qua chuyển khoản VietQR. Sau khi thanh toán thành công, hệ thống tự động kích
        hoạt ngay trên trình duyệt bạn đang dùng, đồng thời gửi mã kích hoạt qua email để bạn dùng
        thêm trên tối đa 3 thiết bị khác. Không chia sẻ mã kích hoạt cho người ngoài.
      </p>

      <h2>5. Quyền sở hữu nội dung</h2>
      <p>
        Giáo án, đề thi, bài tập bạn tạo ra thuộc toàn quyền sử dụng của bạn cho mục đích giảng dạy
        cá nhân. Bạn không được bán lại hoặc phân phối thương mại nội dung này.
      </p>

      <h2>6. Giới hạn trách nhiệm</h2>
      <p>
        Dịch vụ được cung cấp theo hiện trạng (&quot;as-is&quot;). Chúng tôi không đảm bảo dịch vụ
        hoạt động liên tục không gián đoạn và không chịu trách nhiệm cho thiệt hại gián tiếp phát
        sinh từ việc sử dụng nội dung do AI tạo ra mà chưa qua kiểm tra.
      </p>

      <h2>7. Hành vi không được phép</h2>
      <p>
        Không chia sẻ/bán lại mã kích hoạt vượt số thiết bị cho phép, không khai thác lỗi hệ thống
        để dùng vượt giới hạn gói, không dùng công cụ để tạo nội dung vi phạm pháp luật Việt Nam.
      </p>

      <h2>8. Hoàn tiền</h2>
      <p>
        Xem chi tiết tại{" "}
        <Link href="/hoan-tien" className="text-pine hover:text-pine-dark">
          Chính sách hoàn tiền
        </Link>
        .
      </p>

      <h2>9. Liên hệ</h2>
      <p>Điện thoại/Zalo: 0944 851719 · Email: hungniwaco@gmail.com</p>
    </LegalPage>
  );
}
