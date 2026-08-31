import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách hoàn tiền — AI Giáo Án Pro 2026" };

export default function RefundPage() {
  return (
    <LegalPage title="Chính sách hoàn tiền" updatedAt="30/08/2026">
      <h2>1. Trước khi mua</h2>
      <p>
        Bạn được dùng thử miễn phí 2 lượt tạo giáo án trước khi quyết định mua gói. Vui lòng dùng
        thử kỹ để đảm bảo sản phẩm phù hợp nhu cầu trước khi thanh toán.
      </p>

      <h2>2. Điều kiện hoàn tiền</h2>
      <p>
        Chúng tôi hoàn 100% học phí nếu trong vòng 24 giờ kể từ khi kích hoạt, mã kích hoạt của bạn
        không sử dụng được do lỗi từ hệ thống. Chúng tôi không hoàn tiền với các trường hợp đã sử
        dụng quá 5 lượt tạo giáo án sau khi kích hoạt.
      </p>

      <h2>3. Cách yêu cầu hoàn tiền</h2>
      <p>Nhắn tin qua Zalo kèm mã kích hoạt và mô tả lỗi gặp phải, chúng tôi phản hồi trong vòng 24 giờ làm việc.</p>
    </LegalPage>
  );
}
