import { Redis } from "@upstash/redis";

const client = Redis.fromEnv();

// ponytail: cap3 dùng chung 1 Redis DB miễn phí với cap2 (Upstash chỉ cho 1
// DB/tài khoản) — prefix mọi key qua đây để tránh đụng dữ liệu trial-guard/
// orders giữa 2 app. Nâng cấp lên DB riêng khi Upstash trả phí thì xoá Proxy
// này, không cần đổi callsite nào khác.
const PREFIX = "cap3:";

export const redis = new Proxy(client, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== "function") return value;
    return (...args: unknown[]) => {
      if (typeof args[0] === "string") args[0] = PREFIX + args[0];
      return value.apply(target, args);
    };
  },
}) as Redis;
