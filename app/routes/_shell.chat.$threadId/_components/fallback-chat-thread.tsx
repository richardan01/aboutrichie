import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";

export function FallbackChatThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant'}>>([]);

  console.log("🔄 FallbackChatThread render - ThreadID:", threadId);
  console.log("🔄 FallbackChatThread render - Messages:", messages);

  // Use the real backend
  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueAnonymousThread),
    onSuccess: (response, variables) => {
      console.log("✅ Success - Response received:", response);
      console.log("✅ Success - Variables:", variables);
      // Add the AI response to messages
      const aiMessage = {
        id: Date.now().toString(),
        content: response || "No response received",
        role: 'assistant' as const
      };
      console.log("✅ Success - Adding AI message:", aiMessage);
      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        console.log("✅ Success - Updated messages:", newMessages);
        return newMessages;
      });
    },
    onError: (error) => {
      console.error("❌ Error - Failed to get response:", error);
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        role: 'assistant' as const
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleMessageSubmit = async (message: string) => {
    console.log("🚀 Submitting message:", message);
    console.log("🚀 Thread ID:", threadId);
    
    if (!threadId) {
      console.error("❌ No thread ID available");
      return;
    }
    
    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const
    };
    console.log("📤 Adding user message:", userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log("📤 Updated messages with user message:", newMessages);
      return newMessages;
    });

    // Call the real backend
    console.log("📡 Calling backend with:", { threadId, prompt: message });
    continueThreadMutation.mutate({
      threadId,
      prompt: message,
    });
  };

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center w-full justify-center">
      <div className="h-full w-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900 ml-auto max-w-[80%]'
                  : 'bg-gray-100 dark:bg-gray-800 mr-auto max-w-[80%]'
              }`}
            >
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line.split('**').map((part, j) => 
                      j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {continueThreadMutation.isPending && (
            <div className="mb-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 mr-auto max-w-[80%]">
              <p className="text-sm">Richard is typing...</p>
            </div>
          )}
        </div>
        <MessageInputField
          name="message"
          placeholder="Type your message..."
          onContactMe={async () => {
            await handleMessageSubmit("I'd like to contact you. How should I do that?");
          }}
          onSubmit={async (value) => {
            await handleMessageSubmit(value.message);
          }}
          className="w-full max-w-3xl mx-auto sticky bottom-0"
          isSubmitting={continueThreadMutation.isPending}
          rows={1}
        />
      </div>
    </div>
  );
}