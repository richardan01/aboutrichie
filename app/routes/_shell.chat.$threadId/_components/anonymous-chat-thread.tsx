import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback } from "react";
import { useParams } from "react-router";
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
      console.error("Failed to continue thread:", error);
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
