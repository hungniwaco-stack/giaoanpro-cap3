// Pixel đo lường quảng cáo ChatGPT (ads.openai.com → Lượt chuyển đổi).
// Chỉ nạp khi thanh toán thành công: pixel tự phát hiện và băm email/SĐT có trên trang,
// nên tuyệt đối không nạp ở trang còn form nhập thông tin thanh toán.
// Không gửi refCode làm event_id vì nó đồng thời là mã kích hoạt gói.
const PIXEL_ID = "7W5Xk12pfCg2uzwWHcH3yJ";
const SDK_URL = "https://bzrcdn.openai.com/sdk/oaiq.min.js";

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}

export function trackPurchase(planId: string, amountVnd: number) {
  try {
    if (!window.oaiq) {
      const s = document.createElement("script");
      s.text = `(function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;
        var js=d.createElement(s);js.async=true;js.src=u;var f=d.getElementsByTagName(s)[0];
        f.parentNode.insertBefore(js,f);})(window,document,"script","${SDK_URL}");
        oaiq("init",{pixelId:"${PIXEL_ID}"});`;
      document.head.appendChild(s);
    }
    window.oaiq?.("measure", "subscription_created", {
      type: "plan_enrollment",
      plan_id: planId,
      amount: amountVnd,
      currency: "VND",
    });
  } catch {
    // Đo lường hỏng không được làm hỏng trang xác nhận thanh toán.
  }
}
