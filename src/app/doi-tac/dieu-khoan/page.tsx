import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { PLAN_LABEL, PLAN_PRICE_VND, type Plan } from "@/lib/plans";
import { COMMISSION_RATE, commissionFor } from "@/lib/affiliate-limits";

export const metadata: Metadata = { title: "Điều khoản cộng tác viên — Giáo Án Pro Cấp 3" };

const PLANS: Plan[] = ["1M", "6M", "1Y"];
const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export default function AffiliateTermsPage() {
  return (
    <LegalPage title="Điều khoản chương trình cộng tác viên" updatedAt="28/09/2026">
      <h2>1. Chương trình</h2>
      <p>
        Chương trình cộng tác viên của Giáo Án Pro Cấp 3 (cap3.giaoanpro.com) cho phép bạn giới
        thiệu giáo viên dùng dịch vụ bằng link riêng và nhận hoa hồng khi họ thanh toán. Tham gia
        hoàn toàn miễn phí. Giáo Án Pro Cấp 1, Cấp 2 và Cấp 3 mỗi ứng dụng có chương trình, mã giới
        thiệu và số dư hoa hồng riêng — hoa hồng ở ứng dụng này không cộng gộp với ứng dụng khác.
      </p>
      <p>
        Quan hệ giữa bạn và chúng tôi là cộng tác độc lập, không phải quan hệ lao động. Chúng tôi
        không cam kết mức thu nhập nào cho bạn.
      </p>

      <h2>2. Đăng ký và thông tin tài khoản</h2>
      <ul>
        <li>Đăng ký bằng họ tên, email, ngân hàng, số tài khoản và tên chủ tài khoản. Mỗi email có một mã cộng tác viên.</li>
        <li>Thông tin phải chính xác và tài khoản nhận tiền đứng tên chính bạn. Nếu bạn nhập sai, khoản chuyển theo đúng thông tin bạn đã cung cấp được xem là đã hoàn tất.</li>
        <li>Link xem số liệu được gửi qua email và chứa khoá riêng của bạn — ai có link này đều xem được số liệu và thông tin ngân hàng của bạn. Vui lòng không chia sẻ link.</li>
        <li>Muốn đổi thông tin ngân hàng hoặc email, liên hệ chúng tôi theo mục 11.</li>
      </ul>

      <h2>3. Hoa hồng</h2>
      <p>
        Bạn nhận {COMMISSION_RATE * 100}% số tiền mỗi lần khách được giới thiệu thanh toán thành
        công, tính theo giá gói tại thời điểm thanh toán:
      </p>
      <ul>
        {PLANS.map((p) => (
          <li key={p}>
            Gói {PLAN_LABEL[p]} ({vnd(PLAN_PRICE_VND[p])}): hoa hồng {vnd(commissionFor(PLAN_PRICE_VND[p]))}
          </li>
        ))}
      </ul>
      <p>
        Hoa hồng áp dụng trọn đời: khách đã được tính cho bạn thì mọi lần thanh toán sau đó (gia
        hạn, đổi gói) đều có hoa hồng, không giới hạn thời gian.
      </p>

      <h2>4. Cách xác định khách được giới thiệu</h2>
      <ul>
        <li>Khách bấm link giới thiệu của bạn rồi thanh toán trong vòng 30 ngày sẽ được tính cho bạn. Việc này dựa vào cookie trên trình duyệt của khách — nếu khách xoá cookie hoặc đổi trình duyệt/thiết bị trước khi thanh toán, chúng tôi không ghi nhận được.</li>
        <li>Khách đã được tính cho một cộng tác viên (theo email dùng khi thanh toán) thì luôn thuộc cộng tác viên đó; link của người khác bấm sau không thay đổi điều này.</li>
        <li>Đơn thanh toán bằng chính email của bạn không được tính hoa hồng. Đơn chưa thanh toán thành công cũng không được tính.</li>
        <li>Số liệu trên hệ thống của chúng tôi là căn cứ duy nhất để tính hoa hồng.</li>
      </ul>

      <h2>5. Hoàn tiền</h2>
      <p>
        Khách được hoàn tiền theo{" "}
        <Link href="/hoan-tien" className="text-pine underline">Chính sách hoàn tiền</Link>. Khi một
        đơn được hoàn tiền, hoa hồng đã ghi nhận cho đơn đó không bị thu hồi.
      </p>

      <h2>6. Chi trả</h2>
      <ul>
        <li>Hoa hồng được ghi vào số dư của bạn ngay khi khách thanh toán thành công.</li>
        <li>Chúng tôi chuyển khoản hai lần mỗi tháng, vào ngày 15 và ngày cuối cùng của tháng, cho toàn bộ số dư đã ghi nhận trước ngày đó. Ngày chi rơi vào ngày nghỉ thì chuyển vào ngày làm việc kế tiếp.</li>
        <li>Không có mức chi trả tối thiểu.</li>
        <li>Tiền được chuyển đến tài khoản ngân hàng bạn đã đăng ký.</li>
      </ul>

      <h2>7. Thuế</h2>
      <p>
        Hoa hồng là số tiền trước thuế. Bạn tự chịu trách nhiệm kê khai và nộp thuế thu nhập (nếu
        có) theo quy định của pháp luật. Trường hợp pháp luật yêu cầu, chúng tôi có thể khấu trừ
        hoặc kê khai thay phần thuế phải nộp trước khi chi trả.
      </p>

      <h2>8. Hành vi không được phép</h2>
      <ul>
        <li>Gửi tin nhắn hàng loạt khi chưa được người nhận đồng ý hoặc đăng link tràn lan để quấy rối.</li>
        <li>Quảng cáo sai sự thật về dịch vụ, ví dụ hứa hẹn những điều dịch vụ không có.</li>
        <li>Giả danh Giáo Án Pro, cơ quan giáo dục hoặc người khác.</li>
        <li>Tự tạo đơn ảo, dùng email hoặc tài khoản giả để hưởng hoa hồng.</li>
        <li>Can thiệp vào cách hệ thống ghi nhận (giả mạo mã giới thiệu, cookie...).</li>
      </ul>
      <p>
        Nếu bạn vi phạm, chúng tôi sẽ cảnh cáo và có thể ngừng hợp tác với bạn. Hoa hồng đã ghi
        nhận trước thời điểm ngừng hợp tác vẫn được chi trả theo mục 6.
      </p>

      <h2>9. Dữ liệu của bạn</h2>
      <p>
        Chúng tôi lưu họ tên, email và thông tin tài khoản ngân hàng của bạn chỉ để vận hành chương
        trình: gửi link, đối soát và chi trả hoa hồng. Chúng tôi không bán hay chia sẻ dữ liệu này
        cho bên thứ ba, trừ các nhà cung cấp hạ tầng vận hành hệ thống (lưu trữ dữ liệu, gửi email)
        và trường hợp pháp luật yêu cầu. Trang số liệu của bạn chỉ hiển thị email của khách dưới
        dạng che một phần; bạn không được dùng thông tin này để tìm cách liên lạc với khách.
      </p>
      <p>
        Bạn có thể yêu cầu xoá thông tin và ngừng tham gia bất cứ lúc nào (mục 11). Số dư đã ghi
        nhận sẽ được chi trả trước khi xoá.
      </p>

      <h2>10. Chấm dứt và thay đổi điều khoản</h2>
      <ul>
        <li>Bạn có thể ngừng tham gia bất cứ lúc nào. Chúng tôi cũng có thể chấm dứt chương trình hoặc ngừng hợp tác với một cộng tác viên. Số dư đã ghi nhận vẫn được chi trả theo mục 6.</li>
        <li>Chúng tôi có thể cập nhật điều khoản này bằng cách đăng phiên bản mới tại trang này. Điều khoản mới áp dụng cho các đơn thanh toán phát sinh sau ngày cập nhật.</li>
      </ul>

      <h2>11. Liên hệ</h2>
      <p>Điện thoại/Zalo: 0944 851719 · Email: hungniwaco@gmail.com</p>
    </LegalPage>
  );
}
