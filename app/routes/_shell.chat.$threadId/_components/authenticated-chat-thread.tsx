import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { BackendErrors } from "convex/errors";
import { ConvexError } from "convex/values";
import { useCallback } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { ChatThreadBase } from "./chat-thread-base";

export function AuthenticatedChatThread() {
  const { threadId } = useParams<{ threadId: string }>();

  if (!threadId) {
    return <div>Thread not found</div>;
  }

  const messages = useThreadMessages(
    api.ai.query.getThreadMessages,
    {
      threadId,
    },
    {
      initialNumItems: 10,
      stream: true,
    }
  );

  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueThread),
    onError: (error) => {
      if (error instanceof ConvexError) {
        const data = error.data as BackendErrors;
        if (data._tag === "RateLimitExceeded") {
          return toast.error(
            `Rate limit exceeded, please try again in ${Math.ceil(
              data.context.retryAfter / 1000
            )} seconds`
          );
        }
        if (data._tag === "PromptTooLong") {
          return toast.error(
            <div>
              <p>Your message is too long. Please shorten it or contact Richard directly:</p>
              <ul className="mt-2 list-none space-y-1 text-sm">
                <li>
                  Email: <a href="mailto:richardconstantine67@gmail.com" className="underline">richardconstantine67@gmail.com</a>
                </li>
                <li>
                  LinkedIn: <a href="https://www.linkedin.com/in/richieriri/" target="_blank" rel="noopener noreferrer" className="underline">linkedin.com/in/richieriri</a>
                </li>
                <li>
                  Schedule a chat: <a href="https://calendly.com/richieriri/30min" target="_blank" rel="noopener noreferrer" className="underline">calendly.com/richieriri/30min</a>
                </li>
              </ul>
            </div>,
            { duration: 10000 }
          );
        }
      }
      return toast.error("Failed to continue thread");
    },
  });

  const isStreaming =
    continueThreadMutation.isPending ||
    messages.results.some((x) => x.streaming);

  const handleMessageSubmit = useCallback(
    async (message: string) => {
      await continueThreadMutation.mutateAsync({
        threadId,
        prompt: message,
      });
    },
    [threadId, continueThreadMutation]
  );

  return (
    <ChatThreadBase
      isStreaming={isStreaming}
      messages={messages}
      onMessageSubmit={handleMessageSubmit}
      isSubmitting={continueThreadMutation.isPending}
    />
  );
}
