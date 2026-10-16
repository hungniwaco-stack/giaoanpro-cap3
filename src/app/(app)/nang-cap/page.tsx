import { PLAN_PRICE_VND, type Plan } from "@/lib/plans";
import NangCapClient from "./NangCapClient";

// ?plan=1M|6M|1Y từ bảng giá trên giaoanpro.com — chọn sẵn gói, mặc định gói bán chạy.
export default async function NangCapPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams;
  const initialPlan: Plan = typeof plan === "string" && Object.hasOwn(PLAN_PRICE_VND, plan) ? (plan as Plan) : "6M";
  return <NangCapClient initialPlan={initialPlan} />;
}
