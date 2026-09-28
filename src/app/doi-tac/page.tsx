import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AffiliateSignupForm from "@/components/AffiliateSignupForm";
import { PLAN_LABEL, PLAN_PRICE_VND, type Plan } from "@/lib/plans";
import { COMMISSION_RATE, commissionFor } from "@/lib/affiliate-limits";

export const metadata: Metadata = { title: "Cộng tác viên — Giáo Án Pro Cấp 3" };

const PLANS: Plan[] = ["1M", "6M", "1Y"];
const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export default function AffiliatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-ink">Cộng tác viên Giáo Án Pro</h1>
          <p className="mt-2 text-ink-muted">
            Giới thiệu giáo viên dùng Giáo Án Pro và nhận {COMMISSION_RATE * 100}% hoa hồng cho mỗi lần họ thanh toán —
            trọn đời, kể cả khi họ gia hạn.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-paper-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-sand text-left text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Gói</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium">Hoa hồng của bạn</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((p) => (
                  <tr key={p} className="border-t border-ink/10">
                    <td className="px-4 py-3 text-ink">{PLAN_LABEL[p]}</td>
                    <td className="px-4 py-3 text-ink">{vnd(PLAN_PRICE_VND[p])}</td>
                    <td className="px-4 py-3 font-semibold text-pine-dark">{vnd(commissionFor(PLAN_PRICE_VND[p]))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold text-ink">Cách tính</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-muted">
            <li>Khách bấm link giới thiệu của bạn và thanh toán trong vòng 30 ngày là được tính cho bạn.</li>
            <li>Khách đã được tính cho bạn thì mọi lần thanh toán sau (gia hạn, đổi gói) đều có hoa hồng, không giới hạn thời gian.</li>
            <li>Hoa hồng được ghi nhận ngay khi thanh toán thành công và chi trả bằng chuyển khoản tới tài khoản bạn đăng ký.</li>
            <li>Đơn do chính bạn thanh toán bằng email của bạn không được tính hoa hồng.</li>
          </ul>

          <h2 className="mt-10 mb-3 font-display text-lg font-semibold text-ink">Đăng ký</h2>
          <AffiliateSignupForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
