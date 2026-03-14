import { MINUTE, RateLimitConfig, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const DAY = 24 * 60 * MINUTE;

const limitConfig = {
  sendAIMessage: { kind: "fixed window", rate: 10, period: MINUTE },
  sendAIMessageDaily: { kind: "fixed window", rate: 10, period: DAY },
  createAiThread: { kind: "fixed window", rate: 5, period: MINUTE },
} as const satisfies Record<string, RateLimitConfig>;

export type RateLimitName = keyof typeof limitConfig;

export const rateLimiter = new RateLimiter(components.rateLimiter, limitConfig);
