import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useNavigate } from "react-router";
import { SimpleThreadsList } from "./simple-threads-list";

interface SimpleThreadsProps {
  activeThreadId?: string;
}

export function SimpleThreads({ activeThreadId }: SimpleThreadsProps) {
  const navigate = useNavigate();

  // Get threads from our new simple chat system
  const { data: rawThreads = [], isLoading } = useQuery(
    convexQuery(api["chat/queries"].listThreads, {})
  );

  // Map threads to expected format
  const threads = rawThreads.map(thread => ({
    _id: thread.threadId, // Use threadId as _id
    title: thread.title,
    _creationTime: thread.createdAt,
    threadId: thread.threadId, // Keep threadId for navigation
  }));

  const handleThreadSelect = (selectedThreadId: string) => {
    // Find the thread to get the proper threadId
    const thread = threads.find(t => t._id === selectedThreadId);
    if (thread) {
      navigate(`/chat/${thread.threadId}`);
    }
  };

  return (
    <SimpleThreadsList
      threads={threads}
      isLoading={isLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
    />
  );
}