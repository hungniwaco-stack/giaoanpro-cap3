import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách bảo mật — Giáo Án Pro Cấp 3" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updatedAt="16/10/2026">
      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>Nội dung bạn nhập để tạo giáo án, đề thi, bài tập (môn học, khối lớp, tên bài).</li>
        <li>Khi bạn mua gói trả phí: gói đã chọn, số tiền, mã đơn hàng (bắt đầu bằng &quot;GA&quot;) và thời điểm thanh toán. Chúng tôi không yêu cầu email hay số điện thoại; thông tin chuyển khoản (người chuyển, ngân hàng) do ngân hàng và SePay ghi nhận, chúng tôi chỉ dùng mã đơn trong nội dung chuyển khoản để khớp đơn.</li>
        <li>Một mã định danh ẩn danh lưu trong cookie trình duyệt — không cần đăng ký tài khoản.</li>
        <li>Lịch sử các giáo án/đề thi/bài tập bạn đã tạo, lưu tối đa khoảng 400 ngày để bạn xem lại trong mục &quot;Lịch sử&quot;.</li>
        <li>Tên và tên trường bạn nhập ở mục Hồ sơ (để in vào file Word) — chỉ lưu trên trình duyệt của bạn, không gửi lên máy chủ.</li>
        <li>Góp ý bạn tự nguyện gửi sau khi tạo giáo án (lựa chọn, lời nhắn tuỳ chọn và khối lớp, môn học) — lưu ẩn danh, không gắn với mã định danh hay email của bạn, chỉ dùng để cải thiện chất lượng giáo án.</li>
        <li>Khi thanh toán thành công, trang xác nhận nạp công cụ đo lường quảng cáo của OpenAI để ghi nhận một lượt mua (gói đã mua và số tiền), cùng cookie nhận diện lượt bấm quảng cáo nếu bạn đến từ quảng cáo ChatGPT. Trang thanh toán không có ô nhập email hay số điện thoại nên không có thông tin liên hệ nào được gửi cho công cụ này.</li>
        <li>Địa chỉ IP, dùng để giới hạn số lượt dùng thử theo ngày và chống lạm dụng; chỉ lưu tối đa khoảng 2 ngày.</li>
        <li>Tài liệu bạn đính kèm ở mục Cấu Hình (công văn, phụ lục, mẫu giáo án của Sở/trường): file được gửi đến Google Gemini để đọc và tóm tắt (nếu Gemini tạm không dùng được, nội dung chữ của file Word có thể được gửi đến DeepSeek thay thế; file PDF và ảnh chỉ gửi đến Gemini), chúng tôi không lưu file trên máy chủ. Tên file và bản tóm tắt chỉ lưu trên trình duyệt của bạn.</li>
        <li>Nếu bạn đăng ký làm cộng tác viên: họ tên, email, tên ngân hàng, số tài khoản, tên chủ tài khoản, mã cộng tác viên và lịch sử hoa hồng.</li>
        <li>Cookie giới thiệu lưu mã cộng tác viên trong 30 ngày khi bạn vào từ link giới thiệu, dùng để ghi nhận hoa hồng.</li>
      </ul>
      <p>
        Chúng tôi không thu thập mật khẩu hay thông tin thẻ của bạn. Thông tin tài khoản ngân hàng
        chỉ được thu thập từ cộng tác viên để chi trả hoa hồng.
      </p>

      <h2>2. Cách dữ liệu được sử dụng</h2>
      <p>
        Nội dung bạn nhập được gửi đến Google Gemini API để sinh nội dung; khi Gemini tạm không
        khả dụng, hệ thống có thể dùng DeepSeek API dự phòng. Khi thanh toán chúng tôi không thu email hay số điện thoại; mã kích hoạt hiện trực tiếp trên màn hình sau khi thanh toán thành công. Khi bạn cần hỗ trợ hoặc hoàn tiền, chúng tôi đối chiếu bằng mã đơn hàng hoặc biên lai chuyển khoản do bạn cung cấp.
      </p>
      <p>
        Nếu bạn đính kèm tài liệu, nội dung tài liệu cũng được gửi đến Google Gemini API (hoặc DeepSeek
        API dự phòng, chỉ với file Word) để phân tích. Vui lòng không đính kèm tài liệu chứa thông tin cá nhân của học sinh hoặc đồng nghiệp.
      </p>
      <p>
        Nếu khách vào từ link giới thiệu, chúng tôi gắn khách với cộng tác viên đó bằng mã định danh ẩn danh trong cookie của trình duyệt; cộng tác viên chỉ thấy một mã rút gọn của khách, không thấy thông tin liên hệ nào. Thông tin cộng tác viên
        chỉ dùng để gửi link, đối soát và chi trả hoa hồng, xem thêm{" "}
        <Link href="/doi-tac/dieu-khoan" className="text-pine underline">
          Điều khoản chương trình cộng tác viên
        </Link>
        .
      </p>

      <h2>3. Chia sẻ với bên thứ ba</h2>
      <p>
        Dữ liệu được xử lý qua các dịch vụ: Google Gemini API (sinh nội dung AI), DeepSeek API (dịch vụ AI dự phòng khi Gemini không khả dụng), Resend (gửi email cho cộng tác viên), Upstash Redis (lưu trữ dữ liệu tài khoản, lịch sử và
        thông tin cộng tác viên), và SePay (xác nhận giao
        dịch chuyển khoản ngân hàng). Chúng tôi không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục
        đích quảng cáo.
      </p>

      <h2>4. Thanh toán</h2>
      <p>
        Thanh toán thực hiện qua chuyển khoản VietQR do SePay xử lý. Chúng tôi không lưu thông
        tin thẻ hoặc tài khoản ngân hàng của khách hàng khi thanh toán gói trên hệ thống.
      </p>

      <h2>5. Quyền của bạn</h2>
      <p>
        Bạn có thể xoá cookie định danh bất kỳ lúc nào qua cài đặt trình duyệt. Liên hệ 0944 851719
        hoặc hungniwaco@gmail.com nếu muốn yêu cầu xoá lịch sử đã lưu.
      </p>
      <p>
        Cộng tác viên có thể yêu cầu xoá thông tin đã đăng ký; số dư còn lại sẽ được chi trả trước
        khi xoá.
      </p>
    </LegalPage>
  );
}
