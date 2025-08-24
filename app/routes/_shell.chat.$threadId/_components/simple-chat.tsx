import { useConvexAction } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { api } from "convex/_generated/api";
import { MessageInputField } from "~/components/ui/message-input-field";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
}

export function SimpleChat() {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  console.log("🔄 SimpleChat render - ThreadID:", threadId);
  console.log("🔄 SimpleChat render - Messages count:", messages.length);
  console.log("🔄 SimpleChat render - isLoadingHistory:", isLoadingHistory);

  // Load conversation history for this thread
  const getConversationAction = useConvexAction(api["chat/actions"].getConversation);
  
  useEffect(() => {
    if (!threadId) return;
    
    const loadConversationHistory = async () => {
      try {
        console.log("📚 Loading conversation history for thread:", threadId);
        const conversation = await getConversationAction({ threadId });
        
        if (conversation && conversation.length > 0) {
          // Convert conversation to our Message format
          const historyMessages: Message[] = conversation.map((msg, index) => ({
            id: `history_${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }));
          
          console.log("📚 Loaded", historyMessages.length, "messages from history");
          setMessages(historyMessages);
        } else {
          // No history, start with empty messages
          setMessages([]);
        }
      } catch (error) {
        console.error("❌ Failed to load conversation history:", error);
        // Start with empty messages on error
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, [threadId, getConversationAction]);

  // Listen for initial messages from homepage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'INITIAL_MESSAGE' && !hasProcessedInitialMessage) {
        console.log("📨 Received initial message:", event.data.message);
        setHasProcessedInitialMessage(true);
        handleMessageSubmit(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [hasProcessedInitialMessage]);

  // Send message mutation
  const sendMessageAction = useConvexAction(api["chat/actions"].sendMessage);
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: string }) => {
      return await sendMessageAction({ threadId, message });
    },
    onSuccess: (result) => {
      console.log("✅ Message sent successfully:", result);
      console.log("✅ Current messages state:", messages.length);
      
      // Add AI response to messages
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.response,
        timestamp: Date.now()
      };
      
      setMessages(prev => {
        console.log("✅ Previous messages:", prev.length);
        const newMessages = [...prev, aiMessage];
        console.log("✅ New messages after adding AI response:", newMessages.length);
        return newMessages;
      });
    },
    onError: (error) => {
      console.error("❌ Failed to send message:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleMessageSubmit = async (message: string) => {
    console.log("🚀 Submitting message:", message);
    
    if (!threadId) {
      console.error("❌ No thread ID");
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => {
      console.log("📤 Previous messages:", prev.length);
      const newMessages = [...prev, userMessage];
      console.log("📤 New messages after adding user message:", newMessages.length);
      return newMessages;
    });

    // Send to backend
    sendMessageMutation.mutate({
      threadId,
      message,
    });
  };

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No thread ID found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-sm text-muted-foreground">Loading conversation...</div>
          </div>
        ) : (
          messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <div className="text-sm">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line.split('**').map((part, j) => 
                      j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                    )}
                  </p>
                ))}
              </div>
              <div className="text-xs opacity-50 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          ))
        )}
        
        {/* Loading indicator */}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm">Richard is typing...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <MessageInputField
            name="message"
            placeholder="Ask Richard about his experience..."
            onContactMe={async () => {
              await handleMessageSubmit("I'd like to contact you. How should I do that?");
            }}
            onSubmit={async (value) => {
              await handleMessageSubmit(value.message);
            }}
            className="w-full"
            isSubmitting={sendMessageMutation.isPending}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}