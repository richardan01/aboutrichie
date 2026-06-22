import { isRateLimitError } from "@convex-dev/rate-limiter";
import type { GenericDataModel, GenericMutationCtx } from "convex/server";
import { ResultAsync } from "neverthrow";
import * as Errors from "../errors";
import { rateLimiter } from "../rateLimiter";
import type { RateLimitName } from "../rateLimiter";

export function rateLimit(
  ctx: {
    runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
  },
  {
    name,
    key,
  }: {
    name: RateLimitName;
    key?: string;
  }
) {
  return ResultAsync.fromPromise(
    rateLimiter.limit(ctx, name, {
      key: key,
      throws: true,
    }),
    (e) => {
      if (isRateLimitError(e)) {
        return Errors.rateLimitExceeded({
          message: "Rate limit exceeded",
          retryAfter: e.data.retryAfter,
          name,
        });
      }
      return Errors.unknownError({
        message: "Unknown error",
      });
    }
  );
}
