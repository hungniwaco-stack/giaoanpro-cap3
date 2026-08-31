export type Plan = "1M" | "6M" | "1Y";

export const PLAN_DAYS: Record<Plan, number> = {
  "1M": 30,
  "6M": 182,
  "1Y": 365,
};

export const PLAN_PRICE_VND: Record<Plan, number> = {
  "1M": 99_000,
  "6M": 399_000,
  "1Y": 599_000,
};

export const PLAN_LABEL: Record<Plan, string> = {
  "1M": "1 Tháng",
  "6M": "6 Tháng",
  "1Y": "1 Năm",
};
