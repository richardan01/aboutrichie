import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { BackendErrors } from "convex/errors";
import { ConvexError } from "convex/values";
import { useCallback } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ChatThreadBase } from "./chat-thread-base";

function AnonymousChatThreadInner() {
  const { threadId } = useParams<{ threadId: string }>();
  const [anonymousUserId] = useAnonymousUserId();

  if (!threadId) {
    return <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p>Thread ID not found</p>
      </div>
    </div>;
  }

  if (!anonymousUserId) {
    return <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p>Loading user session...</p>
      </div>
    </div>;
  }

  // Get messages for the current thread using anonymous API
  const messages = useThreadMessages(
    api.ai.query.getAnonymousThreadMessages,
    {
      anonymousUserId,
      threadId,
    },
    {
      initialNumItems: 20,
      stream: true,
    }
  );

  // Send message using anonymous API
  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueAnonymousThread),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
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
            "Your message is too long. Please shorten it or contact Richard directly via LinkedIn or email."
          );
        }
      }
      return toast.error("Failed to continue thread");
    },
  });

  const isStreaming =
    continueThreadMutation.isPending ||
    messages.results.some((x) => x.streaming);

  // Handle message submission
  const handleMessageSubmit = useCallback(
    async (message: string) => {
      try {
        await continueThreadMutation.mutateAsync({
          threadId,
          prompt: message,
        });
      } catch (error) {
        console.error("Error submitting message:", error);
        throw error;
      }
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

export function AnonymousChatThread() {
  return (
    <div className="h-full w-full">
      <AnonymousChatThreadInner />
    </div>
  );
}
