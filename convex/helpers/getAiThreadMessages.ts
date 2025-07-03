import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { type Infer, v } from "convex/values";
import { errAsync, ok, ResultAsync } from "neverthrow";
import { QueryCtx } from "../_generated/server";
import { storeAgent } from "../agents/storeAgent";
import * as Errors from "../errors";

export const VGetAiThreadMessagesArgs = v.object({
  threadId: v.string(),
  streamArgs: vStreamArgs,
  paginationOpts: paginationOptsValidator,
  userId: v.string(),
});

export type TGetAiThreadMessagesArgs = Infer<typeof VGetAiThreadMessagesArgs>;

export function getAiThreadMessages(
  ctx: QueryCtx,
  args: TGetAiThreadMessagesArgs
) {
  return ResultAsync.fromPromise(
    storeAgent.getThreadMetadata(ctx, {
      threadId: args.threadId,
    }),
    () =>
      Errors.aiThreadNotFound({
        message: "AI thread not found",
      })
  ).andThen((thread) => {
    if (thread.userId !== args.userId) {
      return errAsync(
        Errors.aiThreadNotFound({
          message: "AI thread not found",
        })
      );
    }

    return ResultAsync.fromPromise(
      storeAgent.listMessages(ctx, {
        threadId: args.threadId,
        paginationOpts: args.paginationOpts,
      }),
      (e) => {
        return Errors.getAiThreadMessagesFailed({
          message: "Failed to get AI thread messages",
        });
      }
    ).andThen((messages) => {
      return ResultAsync.fromPromise(
        storeAgent.syncStreams(ctx, {
          threadId: args.threadId,
          streamArgs: args.streamArgs,
        }),
        (e) => {
          return Errors.getAiThreadMessagesFailed({
            message: "Failed to sync streams",
          });
        }
      ).andThen((streams) => {
        return ok({ ...messages, streams });
      });
    });
  });
}
