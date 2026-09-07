import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách hoàn tiền — Giáo Án Pro Cấp 3" };

export default function RefundPage() {
  return (
    <LegalPage title="Chính sách hoàn tiền" updatedAt="07/09/2026">
      <h2>1. Điều kiện được hoàn tiền</h2>
      <p>Bạn được hoàn 100% số tiền đã thanh toán nếu đáp ứng đủ cả hai điều kiện:</p>
      <ul>
        <li>Yêu cầu hoàn tiền trong vòng 3 ngày kể từ lúc thanh toán thành công.</li>
        <li>
          Chưa tạo quá 3 giáo án/đề thi/bài tập kể từ lúc kích hoạt — bạn có thể tự kiểm tra số
          lượng đã tạo trong mục &quot;Lịch sử&quot; của tài khoản.
        </li>
      </ul>

      <h2>2. Cách yêu cầu hoàn tiền</h2>
      <p>
        Liên hệ Zalo/điện thoại 0944 851719 hoặc email hungniwaco@gmail.com, kèm mã đơn hàng (bắt
        đầu bằng &quot;GA&quot;, có trong email xác nhận kích hoạt) hoặc số điện thoại/email đã
        đăng ký để đối chiếu.
      </p>

      <h2>3. Thời gian xử lý</h2>
      <p>
        Yêu cầu hợp lệ được hoàn tiền trong vòng 3–5 ngày làm việc, qua đúng tài khoản ngân hàng đã
        dùng để thanh toán ban đầu.
      </p>

      <h2>4. Trường hợp không được hoàn tiền</h2>
      <ul>
        <li>Yêu cầu sau 3 ngày kể từ lúc thanh toán.</li>
        <li>Đã tạo quá 3 giáo án/đề thi/bài tập kể từ lúc kích hoạt.</li>
        <li>Tài khoản vi phạm Điều khoản sử dụng (chia sẻ mã kích hoạt, bán lại nội dung...).</li>
      </ul>

      <h2>5. Trường hợp lỗi hệ thống</h2>
      <p>
        Nếu bạn không thể sử dụng dịch vụ do lỗi kỹ thuật từ phía chúng tôi, chúng tôi sẽ gia hạn
        thêm thời gian sử dụng tương ứng hoặc hoàn tiền, tùy mức độ ảnh hưởng thực tế — liên hệ
        theo thông tin ở trên để được hỗ trợ.
      </p>
    </LegalPage>
  );
}
