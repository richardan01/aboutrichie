import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
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
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);


  // Load conversation history for this thread
  const getConversationAction = useConvexAction(api["chat/actions"].getConversation);
  
  useEffect(() => {
    if (!threadId) return;
    
    const loadConversationHistory = async () => {
      try {
        const conversation = await getConversationAction({ threadId });
        
        if (conversation && conversation.length > 0) {
          // Convert conversation to our Message format
          const historyMessages: Message[] = conversation.map((msg: Message, index: number) => ({
            id: `history_${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }));
          
          setMessages(historyMessages);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, [threadId, getConversationAction]);

  // Send message mutation
  const sendMessageAction = useConvexAction(api["chat/actions"].sendMessage);
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: string }) => {
      return await sendMessageAction({ threadId, message });
    },
    onSuccess: (result) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // For initial messages, also refresh the conversation history to ensure persistence
      if (searchParams.get('initialMessage') && hasProcessedInitialMessage) {
        setTimeout(async () => {
          try {
            const conversation = await getConversationAction({ threadId: threadId! });
            if (conversation && conversation.length > 0) {
              const historyMessages: Message[] = conversation.map((msg: Message, index: number) => ({
                id: `history_${index}`,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
              }));
              setMessages(historyMessages);
            }
          } catch {
            // Ignore refresh errors
          }
        }, 1000);
      }
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error?.message || 'Unknown error occurred'}. Please try again.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleMessageSubmit = useCallback(async (message: string) => {
    if (!threadId) {
      return;
    }

    if (!message.trim()) {
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Send to backend
    sendMessageMutation.mutate({
      threadId,
      message,
    });
  }, [threadId, sendMessageMutation]);

  // Process initial message from URL parameters
  useEffect(() => {
    const initialMessage = searchParams.get('initialMessage');
    
    if (initialMessage && !hasProcessedInitialMessage && !isLoadingHistory) {
      setHasProcessedInitialMessage(true);
      handleMessageSubmit(initialMessage);
    }
  }, [searchParams, hasProcessedInitialMessage, isLoadingHistory, handleMessageSubmit]);

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
              className={`max-w-[80%] p-4 rounded-lg border ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
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
            resetOnSubmit={true}
          />
        </div>
      </div>
    </div>
  );
}
